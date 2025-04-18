import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Typography } from '../ui/typography';
import { Transform } from '@ph-blockchain/transformer';
import { Transaction } from '@ph-blockchain/block';

export const FeeToolTip = () => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle size={16} />
      </TooltipTrigger>
      <TooltipContent>
        <Typography>
          (Fixed Fee ({Transform.toHighestUnit(Transaction.FIXED_FEE)}) + Memo
          byte size x {Transform.toHighestUnit(Transaction.BYTES_FEE)})
        </Typography>
      </TooltipContent>
    </Tooltip>
  );
};
