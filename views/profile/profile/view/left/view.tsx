import { FC } from "react";

import { UserKind, UserStatus } from "@/api/services/tendiflow/users/types";
import { BadgeDisplayRow } from "@/components/data-display/badge";
import { DataDisplayContainer } from "@/components/data-display/container";
import { EmailDisplayRow } from "@/components/data-display/email";
import { ImagesDisplayRow } from "@/components/data-display/images";
import { PhonenumberDisplayRow } from "@/components/data-display/phonenumber";
import { TextDisplayRow } from "@/components/data-display/text";
import { useCurrentUserContext } from "@/contexts/current-user";
import { Variant } from "@/types/general";
import { mergeTailwind } from "@/utilities/helpers/tailwind";

interface ProfileContentViewProps {
  className?: string;
}

/**
 * A view component to display the details of a single user.
 */
export const ProfileContentView: FC<ProfileContentViewProps> = ({
  className = "",
}) => {
  const { currentUser: user, isLoading, error } = useCurrentUserContext();

  // Helper to format enum values into human-readable strings
  const formatEnumValue = (value: string): string => {
    return value.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Helper to get a badge variant based on user status
  const getStatusVariant = (status: UserStatus): Variant => {
    switch (status) {
      case UserStatus.ACTIVE:
        return "default";
      case UserStatus.DEACTIVATED:
        return "secondary";
      case UserStatus.PENDING:
        return "secondary";
      default:
        return "outline";
    }
  };

  // Helper to get a badge variant based on user kind
  const getKindVariant = (kind: UserKind): Variant => {
    switch (kind) {
      case UserKind.INTERNAL:
        return "default";
      case UserKind.EXTERNAL:
        return "secondary";
      case UserKind.SYSTEM:
        return "secondary";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} p-6 text-center`}>
        <div className="text-red-600 text-sm">Error loading user: {error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`${className} p-6 text-center`}>
        <div className="text-gray-500 text-sm">No user selected</div>
      </div>
    );
  }

  return (
    <div className={mergeTailwind(className, "w-full")}>
      {/* Personal & Contact Information */}
      <DataDisplayContainer
        title="User Details"
        description="Personal and contact information"
        className="mb-8"
      >
        <TextDisplayRow label="First Name" value={user.first_name} />
        <TextDisplayRow label="Last Name" value={user.last_name} />
        <EmailDisplayRow
          label="Email Address"
          caption={user.email_verified_datetime ? "Verified" : "Not verified"}
          value={user.email}
        />
        <PhonenumberDisplayRow
          label="Phone Number"
          caption={
            user.phone_number_verified_datetime ? "Verified" : "Not verified"
          }
          value={user.phone_number}
        />
        <TextDisplayRow label="Organisation" value={user.organisation_name} />
        <TextDisplayRow label="Division" value={user.division} />
        <TextDisplayRow label="Occupation" value={user.occupation} />
        <TextDisplayRow
          label="Preferred Language"
          value={user.language.toUpperCase()}
        />
      </DataDisplayContainer>

      {/* Status & Roles */}
      <DataDisplayContainer
        title="Status & Roles"
        description="System status and administrative roles"
        className="mb-8"
      >
        <BadgeDisplayRow
          label="Status"
          value={formatEnumValue(user.status)}
          variant={getStatusVariant(user.status)}
        />
        <BadgeDisplayRow
          label="User Kind"
          value={formatEnumValue(user.kind)}
          variant={getKindVariant(user.kind)}
        />
        <BadgeDisplayRow
          label="Admin Access"
          value={user.is_admin ? "Yes" : "No"}
          variant={user.is_admin ? "destructive" : "secondary"}
        />
        <BadgeDisplayRow
          label="Superuser"
          value={user.is_superuser ? "Yes" : "No"}
          variant={user.is_superuser ? "destructive" : "secondary"}
        />
      </DataDisplayContainer>

      {/* Avatar File Details */}
      {user.avatar && (
        <DataDisplayContainer
          title="Avatar"
          description="User's profile picture"
          className="mb-8"
        >
          <ImagesDisplayRow
            label="Avatar Image"
            images={[user.avatar]}
            gridCols={1}
            showMetadata={true}
          />
        </DataDisplayContainer>
      )}

    </div>
  );
};
