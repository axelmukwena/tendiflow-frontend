import { FC, Fragment } from "react";

import { Badge } from "@/components/ui/badge";
import { SelectOptionType } from "@/types/general";
import { getFormattedDateAndTime } from "@/utilities/helpers/date";
import { mergeTailwind } from "@/utilities/helpers/tailwind";
import { getMultilineText } from "@/utilities/helpers/text";

import { TendiflowLink } from "../common/tendiflow-link";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export const LeftSectionContainer = ({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element => (
  <div
    data-slot="left-section-container"
    className={mergeTailwind(
      "flex flex-col items-start justify-start w-full md:w-3/5",
      className,
    )}
    {...props}
  />
);

export const RightSectionContainer = ({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element => (
  <div
    data-slot="right-section-container"
    className={mergeTailwind(
      "flex flex-col items-start justify-start w-full md:w-2/5 gap-4",
      className,
    )}
    {...props}
  />
);

export const ViewContent = ({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element => (
  <div
    data-slot="view-content"
    className={mergeTailwind(
      "flex h-full w-full flex-col md:flex-row gap-4 overflow-hidden",
      className,
    )}
    {...props}
  />
);

export const ViewPageContent = ({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element => (
  <div
    data-slot="view-page-content"
    className={mergeTailwind(
      "flex w-full flex-col gap-4 overflow-hidden",
      className,
    )}
    {...props}
  />
);

export const ViewPageHeaderContainer = ({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element => (
  <div
    data-slot="view-page-header-container"
    className={mergeTailwind(
      "flex items-center justify-between w-full",
      className,
    )}
    {...props}
  />
);

export const ViewPageTitle = ({
  className,
  ...props
}: React.ComponentProps<"h2">): React.JSX.Element => (
  <h2
    data-slot="view-page-title"
    className={mergeTailwind("text-xl font-bold text-gray-900", className)}
    {...props}
  />
);

export const FormViewContent = ({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element => (
  <div
    data-slot="form-view-content"
    className={mergeTailwind(
      "flex w-full flex-col gap-4 overflow-hidden",
      className,
    )}
    {...props}
  />
);

export const ViewSection: FC<{
  title: string;
  contentClassName?: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <Card className="gap-0 sm:gap-6">
    <CardHeader className="relative">
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const ViewItem: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="view-section-item px-6 py-6 sm:grid sm:grid-cols-2 sm:gap-10 sm:px-3">
    {children}
  </div>
);

const ViewLabelContainer: FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="pb-2 sm:pb-0">{children}</div>;

const ViewLabel: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-sm font-medium text-gray-700">{children}</div>
);

const ViewCaption: FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className="text-xs text-gray-500">{children}</div>
);

const ViewValue: FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div className="text-sm text-gray-900">
    {children || <span className="text-gray-400">—</span>}
  </div>
);

interface MultilineTextViewProps {
  text?: string | null;
  texts?: string[];
}

export const MultilineTextView: FC<MultilineTextViewProps> = ({
  text,
  texts,
}) => {
  let lines: string[] = [];
  if (text) {
    lines = getMultilineText(text);
  } else if (texts) {
    lines = texts.flatMap(getMultilineText);
  }

  if (!lines.length) {
    return null;
  }

  return (
    <Fragment>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </Fragment>
  );
};

export const EmptyRenderer: FC = () => (
  <span className="text-sm text-gray-300 cell-text">-</span>
);

export const TextFieldView: FC<{
  label: string;
  value?: string | null;
  caption?: string | null;
  isMultiline?: boolean;
  children?: React.ReactNode;
}> = ({ label, value, caption, isMultiline = false, children }) => (
  <ViewItem>
    <ViewLabelContainer>
      <ViewLabel>{label}</ViewLabel>
      {caption && <ViewCaption>{caption}</ViewCaption>}
    </ViewLabelContainer>
    <ViewValue>
      {isMultiline && value && <MultilineTextView text={value} />}
      {!isMultiline && value && <Fragment>{value}</Fragment>}
      {children}
      {!value && !children && <EmptyRenderer />}
    </ViewValue>
  </ViewItem>
);

export const StatusFieldView: FC<{
  option: string;
  options: SelectOptionType[];
}> = ({ option, options }) => {
  const status = options.find((o) => o.value === option);
  if (!status) {
    return <Badge variant="outline">Unknown</Badge>;
  }
  return (
    <ViewValue>
      <Badge variant={status.badgeVariant}>{status.name}</Badge>
    </ViewValue>
  );
};

export const OptionFieldView: FC<{
  label: string;
  option: string;
  options: SelectOptionType[];
  caption?: string | null;
}> = ({ label, option, options, caption }) => {
  const status = options.find((o) => o.value === option);
  if (!status) {
    return <Badge variant="outline">Unknown</Badge>;
  }
  return (
    <ViewItem>
      <ViewLabelContainer>
        <ViewLabel>{label}</ViewLabel>
        {caption && <ViewCaption>{caption}</ViewCaption>}
      </ViewLabelContainer>
      <ViewValue>
        <Badge variant={status.badgeVariant}>{status.name}</Badge>
      </ViewValue>
    </ViewItem>
  );
};

export const LinkFieldView: FC<{
  label: string;
  name?: string | null;
  href?: string | null;
  caption?: string | null;
}> = ({ label, name, href, caption }) => (
  <ViewItem>
    <ViewLabelContainer>
      <ViewLabel>{label}</ViewLabel>
      {caption && <ViewCaption>{caption}</ViewCaption>}
    </ViewLabelContainer>
    <ViewValue>
      {href && (
        <TendiflowLink href={href} target="_blank" rel="noopener noreferrer">
          {name || href}
        </TendiflowLink>
      )}
      {!href && <EmptyRenderer />}
    </ViewValue>
  </ViewItem>
);

export const UserFieldView: FC<{
  label: string;
  userId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  timestamp?: string | null;
  caption?: string | null;
}> = ({ label, userId, firstName, lastName, timestamp, caption }) => (
  <ViewItem>
    <ViewLabelContainer>
      <ViewLabel>{label}</ViewLabel>
      {caption && <ViewCaption>{caption}</ViewCaption>}
    </ViewLabelContainer>
    <ViewValue>
      <div className="flex flex-col">
        {userId && (
          <TendiflowLink href={`/users/${userId}`}>
            {firstName} {lastName}
          </TendiflowLink>
        )}
        {!userId && <EmptyRenderer />}
        {timestamp && (
          <div className="text-gray-500 mt-1">
            <span>{getFormattedDateAndTime({ utc: timestamp })}</span>
          </div>
        )}
      </div>
    </ViewValue>
  </ViewItem>
);

interface RightSectionDataItemProps {
  label: string;
  children: React.ReactNode;
}

export const RightSectionDataItem: FC<RightSectionDataItemProps> = ({
  label,
  children,
}) => (
  <div className="flex items-start gap-4">
    <dt className="text-sm font-medium text-muted-foreground min-w-35 flex-shrink-0">
      {label}
    </dt>
    <dd className="text-sm text-foreground font-medium min-w-0">{children}</dd>
  </div>
);
