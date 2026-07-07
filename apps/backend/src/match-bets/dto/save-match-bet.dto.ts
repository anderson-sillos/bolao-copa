import { IsInt, IsUUID, Min } from 'class-validator';

export class SaveMatchBetDto {
  @IsUUID()
  gameId: string;

  @IsInt()
  @Min(0)
  scoreA: number;

  @IsInt()
  @Min(0)
  scoreB: number;
}

export class UpdateMatchBetDto {
  @IsInt()
  @Min(0)
  scoreA: number;

  @IsInt()
  @Min(0)
  scoreB: number;
}
