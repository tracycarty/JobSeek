import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Controller, Get, NotFoundException, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class AppController {
  @Get()
  showUi(@Res() response: Response) {
    const indexPath = resolve(process.cwd(), '../frontend/index.html');

    if (!existsSync(indexPath)) {
      throw new NotFoundException('Frontend not found');
    }

    return response.sendFile(indexPath);
  }
}
