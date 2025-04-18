'use client';

import { useMemo, useState } from 'react';
import { Typography } from '../ui/typography';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

export type DisplayMemoProps = {
  rawMemo: string;
};
export const DisplayMemo = ({ rawMemo }: DisplayMemoProps) => {
  const [displayType, setDisplayType] = useState<'encoded' | 'decoded'>(
    'encoded',
  );

  const encodedMemo = useMemo(() => {
    return new Uint8Array(Buffer.from(rawMemo, 'hex'));
  }, [rawMemo]);

  const currentMemo = useMemo(() => {
    if (displayType === 'encoded') return rawMemo;

    return new TextDecoder().decode(encodedMemo);
  }, [rawMemo, encodedMemo, displayType]);

  return (
    <div className="flex flex-col gap-2">
      <Typography as="large">
        Memo ({encodedMemo?.length ?? 0} bytes):
      </Typography>
      <Textarea rows={5} disabled readOnly value={currentMemo} />
      <RadioGroup
        className="mt-2"
        defaultValue={displayType}
        onClick={(e) =>
          setDisplayType(
            (e.target as HTMLInputElement).value as 'encoded' | 'decoded',
          )
        }
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="encoded" id="memo-encoded" />
          <Label htmlFor="memo-encoded">Encoded</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="decoded" id="memo-decoded" />
          <Label htmlFor="memo-decoded">Decoded</Label>
        </div>
      </RadioGroup>
    </div>
  );
};
