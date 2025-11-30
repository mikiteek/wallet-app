import {
  Controller,
  Param,
  Post,
  ParseUUIDPipe,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { WalletService } from '../services';
import { WalletDepositFormDto, WalletViewDto } from '../dto';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { WalletAlreadyExistsError, WalletNotFoundError } from '../errors';
import { TransactionAlreadyExistsError } from '../../transaction/errors';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiCreatedResponse({ type: WalletViewDto })
  @Post('/:id/deposit')
  async deposit(
    @Param('id', ParseUUIDPipe) walletId: string,
    @Body() dto: WalletDepositFormDto,
  ): Promise<WalletViewDto> {
    try {
      const wallet = await this.walletService.depositWallet(walletId, dto);

      return plainToInstance(WalletViewDto, wallet, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (
        error instanceof WalletAlreadyExistsError ||
        error instanceof TransactionAlreadyExistsError ||
        error instanceof WalletNotFoundError
      ) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }
}
