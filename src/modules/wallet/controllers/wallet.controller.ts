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
import {
  WalletDepositFormDto,
  WalletViewDto,
  WalletWithdrawFormDto,
  WalletTransferFormDto,
} from '../dto';
import {
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  WalletAlreadyExistsError,
  WalletNotFoundError,
  InsufficientFundsError,
} from '../errors';
import { TransactionAlreadyExistsError } from '../../transaction/errors';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: WalletViewDto })
  @ApiConflictResponse({ description: 'Wallet or Transaction already exists' })
  @Post('/:id/deposit')
  async deposit(
    @Param('id', ParseUUIDPipe) walletId: string,
    @Body() dto: WalletDepositFormDto,
  ): Promise<WalletViewDto> {
    try {
      const wallet = await this.walletService.depositFunds(walletId, dto);

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
  @ApiOkResponse({ type: WalletViewDto })
  @ApiConflictResponse({ description: 'Transaction already exists' })
  @Post('/:id/withdraw')
  async withdraw(
    @Param('id', ParseUUIDPipe) walletId: string,
    @Body() dto: WalletWithdrawFormDto,
  ): Promise<WalletViewDto> {
    try {
      const wallet = await this.walletService.withdrawFunds(walletId, dto);

      return plainToInstance(WalletViewDto, wallet, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (
        error instanceof TransactionAlreadyExistsError ||
        error instanceof InsufficientFundsError
      ) {
        throw new ConflictException(error.message);
      }

      if (error instanceof WalletNotFoundError) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: WalletViewDto })
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

  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: WalletViewDto })
  @ApiConflictResponse({ description: 'Transaction already exists' })
  @Post('/:id/transfer')
  async transfer(
    @Param('id', ParseUUIDPipe) sourceWalletId: string,
    @Body() dto: WalletTransferFormDto,
  ): Promise<WalletViewDto> {
    try {
      const wallet = await this.walletService.transfer(sourceWalletId, dto);

      return plainToInstance(WalletViewDto, wallet, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (
        error instanceof TransactionAlreadyExistsError ||
        error instanceof InsufficientFundsError
      ) {
        throw new ConflictException(error.message);
      }

      if (error instanceof WalletNotFoundError) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }
}
