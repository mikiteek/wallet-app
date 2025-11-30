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
  NotFoundException,
  Get,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { WalletService } from '../services';
import { WalletDepositFormDto, WalletViewDto } from '../dto';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { WalletAlreadyExistsError, WalletNotFoundError } from '../errors';
import { TransactionAlreadyExistsError } from '../../transaction/errors';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiCreatedResponse({ type: WalletViewDto })
  @ApiConflictResponse({ description: 'Wallet or Transaction already exists' })
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

  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiNotFoundResponse({ description: 'Wallet not found' })
  @Get('/:id')
  async fetch(
    @Param('id', ParseUUIDPipe) walletId: string,
  ): Promise<WalletViewDto> {
    try {
      const wallet = await this.walletService.fetchWallet(walletId);

      return plainToInstance(WalletViewDto, wallet, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof WalletNotFoundError) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }
}
