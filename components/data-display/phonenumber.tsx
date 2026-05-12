import { FC } from "react";

import { TendiflowLink } from "../common/tendiflow-link";
import { DataDisplayRow } from "./row";

interface PhonenumberDisplayRowProps {
  label: string;
  value?: string | null;
  caption?: string | null;
  isEven?: boolean;
  className?: string;
}

export const PhonenumberDisplayRow: FC<PhonenumberDisplayRowProps> = ({
  label,
  value,
  caption,
  className = "",
}) => {
  return (
    <DataDisplayRow label={label} caption={caption} className={className}>
      {value && (
        <TendiflowLink
          href={`tel:${value}`}
          className="inline-flex items-center space-x-2"
        >
          <span>{value}</span>
        </TendiflowLink>
      )}
    </DataDisplayRow>
  );
};
