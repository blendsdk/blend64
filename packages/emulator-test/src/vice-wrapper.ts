/**
 * VICE Emulator wrapper for automated program testing
 */
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import type { ViceOptions, ViceResult, MemoryDump } from './types.js';

export class ViceEmulator {
  constructor(private vicePath: string) {}

  /**
   * Run a program in VICE emulator with automated testing
   * @param options VICE execution options
   * @returns Execution result with performance and memory data
   */
  async runProgram(options: ViceOptions): Promise<ViceResult> {
    const {
      programFile,
      headless = true,
      exitOnIdle = true,
      timeoutMs = 10000,
      memoryDumpAddresses = []
    } = options;

    try {
      // Verify program file exists
      await fs.access(programFile);

      // Build VICE command arguments
      const args = this.buildViceArgs({
        programFile,
        headless,
        exitOnIdle,
        memoryDumpAddresses
      });

      const startTime = Date.now();
      const result = await this.executeVice(args, timeoutMs);
      const executionTimeMs = Date.now() - startTime;

      // Parse memory dumps if requested
      const memoryDumps = memoryDumpAddresses.length > 0
        ? await this.parseMemoryDumps(result.stdout, memoryDumpAddresses)
        : undefined;

      // Parse cycle count from output
      const cycleCount = this.parseCycleCount(result.stdout);

      // VICE exit code 1 with cycle limit reached is actually success
      const isSuccess = result.exitCode === 0 ||
                       (result.exitCode === 1 && result.stdout.includes('cycle limit reached'));

      return {
        success: isSuccess,
        exitCode: result.exitCode,
        executionTimeMs,
        cycleCount,
        memoryDumps,
        output: result.stdout,
        errors: result.stderr ? [result.stderr] : undefined
      };
    } catch (error) {
      return {
        success: false,
        exitCode: -1,
        executionTimeMs: 0,
        errors: [`VICE execution failed: ${(error as Error).message}`]
      };
    }
  }

  /**
   * Build VICE command line arguments
   * @param options Vice execution configuration
   * @returns Array of command line arguments
   */
  private buildViceArgs(options: {
    programFile: string;
    headless: boolean;
    exitOnIdle: boolean;
    memoryDumpAddresses: number[];
  }): string[] {
    const args: string[] = [];

    if (options.headless) {
      args.push('-console');  // Console mode (no GUI)
    }

    if (options.exitOnIdle) {
      args.push('-limitcycles', '1000000');  // Limit execution cycles
    }

    // For now, skip memory monitoring to get basic execution working
    // TODO: Implement proper monitor commands file creation

    // Program file to load and run
    args.push(options.programFile);

    return args;
  }

  /**
   * Execute VICE with given arguments
   * @param args Command line arguments
   * @param timeoutMs Execution timeout in milliseconds
   * @returns Execution result
   */
  private async executeVice(args: string[], timeoutMs: number): Promise<{
    exitCode: number;
    stdout: string;
    stderr: string;
  }> {
    return new Promise((resolve, reject) => {
      // Set environment variables that VICE needs
      const env: NodeJS.ProcessEnv = {
        ...process.env,
        PROGRAM: 'x64sc',  // Tell VICE to run as x64sc emulator
        VICE_INITIAL_CWD: process.cwd()
      };

      const viceProcess = spawn(this.vicePath, args, { env });
      let stdout = '';
      let stderr = '';

      // Set timeout
      const timeout = setTimeout(() => {
        viceProcess.kill('SIGTERM');
        reject(new Error(`VICE execution timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      viceProcess.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      viceProcess.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      viceProcess.on('close', (code: number) => {
        clearTimeout(timeout);
        resolve({
          exitCode: code,
          stdout,
          stderr
        });
      });

      viceProcess.on('error', (error: Error) => {
        clearTimeout(timeout);
        reject(new Error(`Failed to execute VICE: ${error.message}`));
      });
    });
  }

  /**
   * Parse memory dumps from VICE output
   * @param output VICE stdout output
   * @param addresses Requested memory addresses
   * @returns Array of memory dumps
   */
  private async parseMemoryDumps(output: string, addresses: number[]): Promise<MemoryDump[]> {
    const memoryDumps: MemoryDump[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      // Parse VICE memory dump format: ">C:ffff  01 02 03"
      const match = line.match(/^>C:([0-9a-fA-F]+)\s+([0-9a-fA-F\s]+)/);
      if (match) {
        const address = parseInt(match[1], 16);
        const values = match[2].trim().split(/\s+/);

        // Check if this address was requested
        if (addresses.includes(address)) {
          memoryDumps.push({
            address,
            value: parseInt(values[0], 16)
          });
        }
      }
    }

    return memoryDumps;
  }

  /**
   * Parse cycle count from VICE output
   * @param output VICE stdout output
   * @returns Cycle count or undefined if not found
   */
  private parseCycleCount(output: string): number | undefined {
    const lines = output.split('\n');

    for (const line of lines) {
      // Look for cycle count patterns in VICE output
      const match = line.match(/cycles?\s*:?\s*(\d+)/i);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    return undefined;
  }

  /**
   * Load and run a program with memory validation
   * @param programFile Program file to load
   * @param expectedMemory Expected memory states for validation
   * @returns Test result with memory validation
   */
  async validateMemoryStates(
    programFile: string,
    expectedMemory: Array<{ address: number; expectedValue: number }>
  ): Promise<{
    success: boolean;
    memoryFailures: Array<{ address: number; expected: number; actual: number }>;
    viceResult: ViceResult;
  }> {
    const addresses = expectedMemory.map(m => m.address);

    const viceResult = await this.runProgram({
      programFile,
      memoryDumpAddresses: addresses
    });

    const memoryFailures: Array<{ address: number; expected: number; actual: number }> = [];

    if (viceResult.success && viceResult.memoryDumps) {
      for (const expected of expectedMemory) {
        const actual = viceResult.memoryDumps.find(d => d.address === expected.address);
        if (actual && actual.value !== expected.expectedValue) {
          memoryFailures.push({
            address: expected.address,
            expected: expected.expectedValue,
            actual: actual.value
          });
        }
      }
    }

    return {
      success: viceResult.success && memoryFailures.length === 0,
      memoryFailures,
      viceResult
    };
  }

  /**
   * Get VICE version information
   * @returns Version string or error message
   */
  async getVersion(): Promise<string> {
    try {
      const result = await this.executeVice(['-version'], 5000);
      return result.stdout.trim() || result.stderr.trim() || 'Version unknown';
    } catch (error) {
      return `Version check failed: ${(error as Error).message}`;
    }
  }
}
