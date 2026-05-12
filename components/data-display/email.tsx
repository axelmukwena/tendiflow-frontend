import { FC } from "react";

import { TendiflowLink } from "../common/tendiflow-link";
import { DataDisplayRow } from "./row";

interface EmailDisplayRowProps {
  label: string;
  value?: string | null;
  caption?: string | null;
  className?: string;
}

export const EmailDisplayRow: FC<EmailDisplayRowProps> = ({
  label,
  value,
  caption,
  className = "",
}) => {
  return (
    <DataDisplayRow label={label} caption={caption} className={className}>
      {value && (
        <TendiflowLink
          href={`mailto:${value}`}
          className="inline-flex items-center space-x-2"
        >
          <span className="truncate">{value}</span>
        </TendiflowLink>
      )}
    </DataDisplayRow>
  );
};
