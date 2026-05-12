import { ExternalLinkIcon } from "lucide-react";
import { FC } from "react";

import { TendiflowLink } from "../common/tendiflow-link";
import { DataDisplayRow } from "./row";

interface LinkDisplayRowProps {
  label: string;
  value?: string | null;
  href?: string | null;
  caption?: string | null;
  external?: boolean;
  className?: string;
}

export const LinkDisplayRow: FC<LinkDisplayRowProps> = ({
  label,
  value,
  href,
  caption,
  external = true,
  className = "",
}) => {
  const linkUrl = href || value;
  return (
    <DataDisplayRow label={label} caption={caption} className={className}>
      {linkUrl && (
        <TendiflowLink
          href={linkUrl}
          target={external ? "_blank" : "_self"}
          rel={external ? "noopener noreferrer" : undefined}
          className="inline-flex items-center space-x-1"
        >
          <span className="truncate">{value}</span>
          {external && <ExternalLinkIcon className="w-3 h-3 flex-shrink-0" />}
        </TendiflowLink>
      )}
    </DataDisplayRow>
  );
};
