import { MapPinIcon } from "lucide-react";
import { FC } from "react";

import { TendiflowLink } from "../common/tendiflow-link";
import { DataDisplayRow } from "./row";

interface Address {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;
}

interface AddressDisplayRowProps {
  label: string;
  caption?: string;
  address?: Address | string | null;
  showMapLink?: boolean;
  className?: string;
}

export const AddressDisplayRow: FC<AddressDisplayRowProps> = ({
  label,
  caption,
  address,
  showMapLink = true,
  className = "",
}) => {
  // Don't render if no address
  if (!address) return null;

  const formatAddress = (addr: Address | string): string => {
    if (typeof addr === "string") return addr;
    const parts = [
      addr.street,
      addr.city,
      addr.state,
      addr.postal_code,
      addr.country,
    ].filter(Boolean);

    return parts.join(", ");
  };

  const addressString = formatAddress(address);
  if (!addressString) return null;

  const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(addressString)}`;

  return (
    <DataDisplayRow label={label} caption={caption} className={className}>
      <div className="space-y-2">
        <div className="inline-flex items-start space-x-2">
          <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <span className="text-sm">
            {addressString} (
            {showMapLink && (
              <TendiflowLink
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs"
              >
                View on Maps
              </TendiflowLink>
            )}
            )
          </span>
        </div>
      </div>
    </DataDisplayRow>
  );
};
