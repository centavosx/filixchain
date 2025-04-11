import { CheckCheckIcon, CircleXIcon } from 'lucide-react';
import { Typography } from '../ui/typography';

import { ReactNode } from 'react';
import { toast } from 'sonner';

export type CustomToastProps = {
  icon: ReactNode;
  title?: string;
  subtitle?: string;
  messages?: string[];
};

export const CustomToast = ({
  icon,
  title,
  subtitle,
  messages,
}: CustomToastProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 items-center">
        {icon}
        <Typography as="large">{title}</Typography>
      </div>
      {!!subtitle && <Typography as="small">{subtitle}</Typography>}
      {!!messages && (
        <ul className="flex flex-col list-disc list-inside">
          {messages.map((value, index) => (
            <Typography key={index} as="list">
              {value}
            </Typography>
          ))}
        </ul>
      )}
    </div>
  );
};

export type AppToastProps = {
  title?: string;
  subtitle?: string;
  messages?: string[];
  type?: 'success' | 'error';
};
export const appToast = (props: AppToastProps) => {
  const { title, messages, subtitle, type } = props;

  return toast(
    <CustomToast
      icon={
        type === 'error' ? (
          <CircleXIcon color="red" size={16} />
        ) : type === 'success' ? (
          <CheckCheckIcon color="green" size={16} />
        ) : undefined
      }
      title={title}
      messages={messages}
      subtitle={subtitle}
    />,
    { duration: 10000 },
  );
};
