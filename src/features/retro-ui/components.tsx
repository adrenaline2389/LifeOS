import { useId } from "react";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";

import styles from "./retro-ui.module.css";
import { cx } from "./utils";

export type ButtonVariant = "default" | "primary" | "danger" | "quiet";
export type ButtonSize = "sm" | "md" | "lg";

export type StartupScreenProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  title: ReactNode;
  subtitle?: ReactNode;
  status?: ReactNode;
  actionLabel?: ReactNode;
  onAction?: () => void;
};

export function StartupScreen({
  title,
  subtitle,
  status,
  actionLabel,
  onAction,
  children,
  className,
  "aria-label": ariaLabel,
  ...sectionProps
}: StartupScreenProps) {
  const computedAriaLabel =
    ariaLabel ?? (typeof title === "string" ? `${title} startup screen` : "Startup screen");
  const actionAriaLabel =
    typeof actionLabel === "string" ? actionLabel : "启动";

  return (
    <section
      aria-label={computedAriaLabel}
      className={cx("retro-ui-startup-screen", styles.startupScreen, className)}
      {...sectionProps}
    >
      {actionLabel ? (
        <button
          aria-label={actionAriaLabel}
          className={cx(
            "retro-ui-startup-action",
            styles.startupGlyph,
            styles.startupGlyphButton,
          )}
          onClick={onAction}
          type="button"
        />
      ) : (
        <div aria-hidden="true" className={styles.startupGlyph} />
      )}
      <h1 className={styles.startupTitle}>{title}</h1>
      {subtitle ? <p className={styles.startupSubtitle}>{subtitle}</p> : null}
      {status ? <p className={styles.startupStatus}>{status}</p> : null}
      {children}
    </section>
  );
}

export type WindowFrameProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  title: ReactNode;
  actions?: ReactNode;
  statusBar?: ReactNode;
};

export function WindowFrame({
  title,
  actions,
  statusBar,
  children,
  className,
  "aria-labelledby": ariaLabelledBy,
  ...sectionProps
}: WindowFrameProps) {
  const generatedTitleId = useId();
  const titleId = ariaLabelledBy ?? generatedTitleId;

  return (
    <section
      aria-labelledby={titleId}
      className={cx("retro-ui-window-frame", styles.windowFrame, className)}
      role="region"
      {...sectionProps}
    >
      <div className={styles.titleBar}>
        <div aria-hidden="true" className={styles.titleControls}>
          <span className={cx("retro-ui-title-control", styles.titleControl)} />
          <span className={cx("retro-ui-title-control", styles.titleControl)} />
          <span className={cx("retro-ui-title-control", styles.titleControl)} />
        </div>
        <h2 className={styles.titleText} id={titleId}>
          {title}
        </h2>
        <div className={styles.windowActions}>{actions}</div>
      </div>
      <div className={styles.windowBody}>{children}</div>
      {statusBar ? (
        <div className={styles.windowStatusBar}>
          <span
            aria-hidden="true"
            className={cx("retro-ui-mac-face", styles.macFace)}
          >
            <span className={styles.macFaceEyeLeft} />
            <span className={styles.macFaceEyeRight} />
            <span className={styles.macFaceNose} />
            <span className={styles.macFaceNoseFoot} />
            <span className={styles.macFaceMouthLeft} />
            <span className={styles.macFaceMouthRight} />
            <span className={styles.macFaceMouth} />
          </span>
          <span className={styles.windowStatusText}>{statusBar}</span>
        </div>
      ) : null}
    </section>
  );
}

export type PanelVariant = "default" | "inset";

export type PanelProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  title?: ReactNode;
  variant?: PanelVariant;
};

export function Panel({
  title,
  variant = "default",
  children,
  className,
  "aria-labelledby": ariaLabelledBy,
  ...sectionProps
}: PanelProps) {
  const generatedTitleId = useId();
  const titleId = ariaLabelledBy ?? generatedTitleId;
  const hasTitle = title !== undefined && title !== null;

  return (
    <section
      aria-labelledby={hasTitle ? titleId : undefined}
      className={cx(
        "retro-ui-panel",
        styles.panel,
        variant === "inset" && styles.panelInset,
        className,
      )}
      role="region"
      {...sectionProps}
    >
      {hasTitle ? (
        <h3 className={styles.panelTitle} id={titleId}>
          {title}
        </h3>
      ) : null}
      {children}
    </section>
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = "default",
  size = "md",
  type = "button",
  className,
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      className={cx(
        "retro-ui-button",
        styles.button,
        variant === "primary" && styles.buttonPrimary,
        variant === "danger" && styles.buttonDanger,
        variant === "quiet" && styles.buttonQuiet,
        size === "sm" && styles.buttonSmall,
        size === "lg" && styles.buttonLarge,
        className,
      )}
      type={type}
      {...buttonProps}
    />
  );
}

export type MultiSelectOption = {
  id: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};

export type MultiSelectOptionGroupProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> & {
  label: ReactNode;
  options: MultiSelectOption[];
  value: string[];
  onChange: (nextValue: string[]) => void;
  min?: number;
  max?: number;
  helperText?: ReactNode;
  disabled?: boolean;
};

export function MultiSelectOptionGroup({
  label,
  options,
  value,
  onChange,
  min = 0,
  max,
  helperText,
  disabled = false,
  className,
  ...groupProps
}: MultiSelectOptionGroupProps) {
  const labelId = useId();
  const helperId = useId();
  const normalizedMin = Math.max(0, min);
  const normalizedMax =
    max === undefined
      ? Number.POSITIVE_INFINITY
      : Math.max(normalizedMin, max);
  const hasMax = Number.isFinite(normalizedMax);

  function toggleOption(option: MultiSelectOption) {
    if (disabled || option.disabled) return;

    const selected = value.includes(option.id);

    if (selected) {
      if (value.length <= normalizedMin) return;
      onChange(value.filter((selectedId) => selectedId !== option.id));
      return;
    }

    if (value.length >= normalizedMax) return;
    onChange([...value, option.id]);
  }

  return (
    <div
      aria-describedby={helperText ? helperId : undefined}
      aria-labelledby={labelId}
      className={cx("retro-ui-multi-select", styles.multiSelect, className)}
      role="group"
      {...groupProps}
    >
      <div className={styles.multiSelectHeader}>
        <span className={styles.multiSelectLabel} id={labelId}>
          {label}
        </span>
        <span aria-live="polite" className={styles.multiSelectCount}>
          {hasMax ? `${value.length}/${normalizedMax}` : value.length}
        </span>
      </div>
      {helperText ? (
        <p className={styles.multiSelectHelper} id={helperId}>
          {helperText}
        </p>
      ) : null}
      <div className={styles.optionList}>
        {options.map((option) => {
          const selected = value.includes(option.id);
          const cappedOut = !selected && value.length >= normalizedMax;
          const belowMinimum = selected && value.length <= normalizedMin;
          const optionDisabled =
            disabled || option.disabled || cappedOut || belowMinimum;

          return (
            <button
              aria-pressed={selected}
              className={styles.optionButton}
              disabled={optionDisabled}
              key={option.id}
              onClick={() => toggleOption(option)}
              type="button"
            >
              <span aria-hidden="true" className={styles.optionMark} />
              <span className={styles.optionText}>
                <span>{option.label}</span>
                {option.description ? (
                  <span className={styles.optionDescription}>
                    {option.description}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type DialogProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  open: boolean;
  title: ReactNode;
  confirmLabel: ReactNode;
  cancelLabel: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmVariant?: ButtonVariant;
};

export function Dialog({
  open,
  title,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  confirmVariant = "primary",
  children,
  className,
  "aria-labelledby": ariaLabelledBy,
  ...dialogProps
}: DialogProps) {
  const generatedTitleId = useId();
  const titleId = ariaLabelledBy ?? generatedTitleId;

  if (!open) return null;

  return (
    <div className={styles.dialogOverlay}>
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className={cx("retro-ui-dialog", styles.dialog, className)}
        role="dialog"
        {...dialogProps}
      >
        <div className={styles.titleBar}>
          <div aria-hidden="true" className={styles.titleControls}>
            <span className={styles.titleControl} />
          </div>
          <h2 className={styles.titleText} id={titleId}>
            {title}
          </h2>
          <div />
        </div>
        <div className={styles.dialogBody}>{children}</div>
        <div className={styles.dialogActions}>
          <Button onClick={onCancel} variant="quiet">
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} variant={confirmVariant}>
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}

export type StatusLabelTone =
  | "neutral"
  | "pending"
  | "ok"
  | "warning"
  | "danger";

export type StatusLabelProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: StatusLabelTone;
};

export function StatusLabel({
  tone = "neutral",
  className,
  ...spanProps
}: StatusLabelProps) {
  return (
    <span
      className={cx(
        "retro-ui-status-label",
        styles.statusLabel,
        tone === "neutral" && styles.statusNeutral,
        tone === "pending" && styles.statusPending,
        tone === "ok" && styles.statusOk,
        tone === "warning" && styles.statusWarning,
        tone === "danger" && styles.statusDanger,
        className,
      )}
      {...spanProps}
    />
  );
}

export type SourceReferenceItem = {
  id: string;
  label: ReactNode;
  detail?: ReactNode;
};

export type SourceReferenceProps = HTMLAttributes<HTMLElement> & {
  title?: ReactNode;
  items: SourceReferenceItem[];
};

export function SourceReference({
  title = "来源",
  items,
  className,
  "aria-label": ariaLabel,
  ...asideProps
}: SourceReferenceProps) {
  const computedAriaLabel =
    ariaLabel ?? (typeof title === "string" ? title : "Source references");

  return (
    <aside
      aria-label={computedAriaLabel}
      className={cx("retro-ui-source-reference", styles.sourceReference, className)}
      {...asideProps}
    >
      <p className={styles.sourceTitle}>{title}</p>
      <ul className={styles.sourceList}>
        {items.map((item) => (
          <li className={styles.sourceItem} key={item.id}>
            <span>{item.label}</span>
            {item.detail ? (
              <span className={styles.sourceDetail}>{item.detail}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </aside>
  );
}
