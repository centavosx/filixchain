'use client';

import * as React from 'react';
import { Textarea } from '../ui/textarea';

const ProtectedTextarea = React.forwardRef<
  HTMLTextAreaElement,
  Omit<React.ComponentProps<'textarea'>, 'value'> & {
    value: string;
    masked?: boolean;
  }
>(({ value, onChange, onSelect, masked = true, ...props }, ref) => {
  const selection = React.useRef({
    selectionStart: 0,
    selectionEnd: 0,
  });
  const [_value, _setValue] = React.useState(value);

  React.useEffect(() => {
    _setValue(value.replaceAll(/[^\s\n]/g, '\u2022'));
  }, [value]);

  const handleSelect = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    selection.current.selectionStart = event.target.selectionStart;
    selection.current.selectionEnd = event.target.selectionEnd;
    onSelect?.(event);
  };

  if (!masked) {
    return (
      <Textarea
        ref={ref}
        value={value}
        onChange={onChange}
        onSelect={handleSelect}
        {...props}
      />
    );
  }

  const handleChangeText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = event.target.value;
    const diff = input.length - value.length;
    let newValue = value;

    const { selectionStart, selectionEnd } = selection.current;

    if (diff > 0) {
      const inserted = input.slice(selectionStart, selectionStart + diff);
      newValue =
        value.slice(0, selectionStart) + inserted + value.slice(selectionEnd);
    } else if (diff < 0) {
      if (selectionStart !== selectionEnd) {
        newValue = value.slice(0, selectionStart) + value.slice(selectionEnd);
      } else {
        const deleteStart = selectionStart - 1;
        const deleteEnd = selectionStart;
        newValue = value.slice(0, deleteStart) + value.slice(deleteEnd);
      }
    }

    event.target.value = newValue;

    onChange?.(event);
  };

  return (
    <Textarea
      ref={ref}
      value={_value}
      onChange={handleChangeText}
      onSelect={handleSelect}
      {...props}
    />
  );
});
ProtectedTextarea.displayName = 'ProtectedTextarea';

export { ProtectedTextarea };
