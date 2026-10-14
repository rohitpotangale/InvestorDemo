import React, { useEffect, useState } from 'react';
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
} from 'react';

/**
 * Local development stand-in for the small set of components imported from
 * @citi-icg-172888/icgds-react by ClientProfiles.tsx.
 *
 * This is intentionally a visual/behavioral mock, not a pixel-perfect copy of
 * Citi ICGDS. Replace this import with the real package in an environment that
 * has access to it.
 */

const palette = {
  navy: '#056DAE',
  navyHover: '#04598F',
  text: '#172B4D',
  muted: '#5E6C84',
  border: '#C1C7D0',
  surface: '#FFFFFF',
  soft: '#F4F7FA',
  danger: '#B42318',
  success: '#067647',
};

const controlBase: CSSProperties = {
  boxSizing: 'border-box',
  font: 'inherit',
  borderRadius: 6,
  transition: 'background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease',
};

export type MockButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> & {
  color?: 'primary' | 'secondary' | 'outline' | 'default' | 'danger' | string;
  size?: 'xs' | 'small' | 'default' | 'large' | string;
  loading?: boolean;
};

export function Button({
  color = 'primary',
  size = 'default',
  loading = false,
  disabled,
  className = '',
  style,
  children,
  type = 'button',
  ...props
}: MockButtonProps) {
  const sizes: Record<string, CSSProperties> = {
    xs: { minHeight: 26, padding: '3px 8px', fontSize: 12 },
    small: { minHeight: 30, padding: '5px 10px', fontSize: 13 },
    default: { minHeight: 36, padding: '7px 12px', fontSize: 14 },
    large: { minHeight: 42, padding: '9px 16px', fontSize: 15 },
  };
  const variants: Record<string, CSSProperties> = {
    primary: { color: '#FFFFFF', background: palette.navy, border: `1px solid ${palette.navy}` },
    secondary: { color: palette.navy, background: '#EAF4FA', border: '1px solid #B8D9EB' },
    outline: { color: palette.text, background: '#FFFFFF', border: `1px solid ${palette.border}` },
    default: { color: palette.text, background: '#FFFFFF', border: `1px solid ${palette.border}` },
    danger: { color: '#FFFFFF', background: palette.danger, border: `1px solid ${palette.danger}` },
  };

  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      className={`icg-mock-button ${className}`.trim()}
      style={{
        ...controlBase,
        ...(sizes[size] ?? sizes.default),
        ...(variants[color] ?? variants.primary),
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {loading && <Loading size="xs" />}
      {children}
    </button>
  );
}

const iconGlyphs: Record<string, string> = {
  database: '▤',
  add: '+',
  'add-circle-o': '⊕',
  check: '✓',
  info: 'i',
  'info-circle': 'ⓘ',
  'chevron-right': '›',
  'chevron-down': '⌄',
  search: '⌕',
  close: '×',
  refresh: '↻',
  'trash-o': '♲',
  shield: '⬟',
  warning: '⚠',
  'times-circle': '×',
  spinner: '◌',
};

export interface MockIconProps {
  type?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'large' | string;
  className?: string;
  title?: string;
  style?: CSSProperties;
}

export function Icon({ type = 'info', size = 'md', className = '', title, style }: MockIconProps) {
  const fontSizes: Record<string, number> = {
    xs: 11, sm: 14, small: 14, md: 16, medium: 16, lg: 20, large: 22,
  };
  return (
    <span
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-label={title}
      className={`icg-mock-icon icg-mock-icon-${type} ${className}`.trim()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '0 0 auto',
        minWidth: 1,
        fontSize: fontSizes[size] ?? 16,
        lineHeight: 1,
        fontWeight: 700,
        ...style,
      }}
    >
      {iconGlyphs[type] ?? '◆'}
    </span>
  );
}

export type MockInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  iconPrefix?: string;
  size?: 'small' | 'default' | 'large' | string;
};

export function Input({
  iconPrefix,
  className = '',
  style,
  disabled,
  ...props
}: MockInputProps) {
  const [focused, setFocused] = useState(false);
  const inputStyle: CSSProperties = {
    ...controlBase,
    width: '100%',
    minWidth: 0,
    minHeight: 36,
    padding: iconPrefix ? '8px 10px 8px 34px' : '8px 10px',
    border: `1px solid ${focused ? palette.navy : palette.border}`,
    outline: 'none',
    color: palette.text,
    background: disabled ? '#F4F5F7' : '#FFFFFF',
    boxShadow: focused ? '0 0 0 2px rgba(5, 109, 174, 0.14)' : 'none',
    opacity: disabled ? 0.65 : 1,
    ...style,
  };
  return (
    <span className={`icg-mock-input-wrap ${className}`.trim()} style={{ position: 'relative', display: 'inline-flex', width: '100%' }}>
      {iconPrefix && <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: palette.muted, pointerEvents: 'none' }}><Icon type={iconPrefix} size="sm" /></span>}
      <input
        {...props}
        disabled={disabled}
        style={inputStyle}
        onFocus={(event) => { setFocused(true); props.onFocus?.(event); }}
        onBlur={(event) => { setFocused(false); props.onBlur?.(event); }}
      />
    </span>
  );
}

export function Loading({ size = 'default', label }: { size?: 'xs' | 'small' | 'default' | 'large' | string; label?: string }) {
  const diameter = size === 'xs' ? 12 : size === 'small' ? 16 : size === 'large' ? 28 : 20;
  return (
    <span
      role="status"
      aria-label={label ?? 'Loading'}
      className="icg-mock-loading"
      style={{
        display: 'inline-block',
        width: diameter,
        height: diameter,
        boxSizing: 'border-box',
        verticalAlign: 'middle',
        border: '2px solid #C9DCE8',
        borderTopColor: palette.navy,
        borderRadius: '50%',
        animation: 'icg-mock-spin 700ms linear infinite',
      }}
    />
  );
}

export type MockNotificationInput = {
  title?: ReactNode;
  content?: ReactNode;
  message?: ReactNode;
  duration?: number;
};

type ToastKind = 'info' | 'success' | 'error' | 'warning';
type ToastItem = MockNotificationInput & { id: number; kind: ToastKind };
type ToastListener = (toasts: ToastItem[]) => void;

let nextToastId = 1;
let toastItems: ToastItem[] = [];
const toastListeners = new Set<ToastListener>();
const publishToasts = () => toastListeners.forEach((listener) => listener([...toastItems]));

function pushToast(kind: ToastKind, input: MockNotificationInput | ReactNode) {
  const normalized: MockNotificationInput =
    typeof input === 'object' && input !== null && !React.isValidElement(input) && ('title' in input || 'content' in input || 'message' in input || 'duration' in input)
      ? input as MockNotificationInput
      : { content: input as ReactNode };
  const id = nextToastId++;
  toastItems = [...toastItems, { ...normalized, id, kind }];
  publishToasts();
  const duration = normalized.duration ?? 3500;
  if (duration > 0) {
    window.setTimeout(() => {
      toastItems = toastItems.filter((toast) => toast.id !== id);
      publishToasts();
    }, duration);
  }
}

export const notification = {
  info: (input: MockNotificationInput | ReactNode) => pushToast('info', input),
  success: (input: MockNotificationInput | ReactNode) => pushToast('success', input),
  error: (input: MockNotificationInput | ReactNode) => pushToast('error', input),
  warning: (input: MockNotificationInput | ReactNode) => pushToast('warning', input),
};

const toastColors: Record<ToastKind, { edge: string; icon: string }> = {
  info: { edge: '#056DAE', icon: 'ⓘ' },
  success: { edge: '#067647', icon: '✓' },
  error: { edge: '#B42318', icon: '!' },
  warning: { edge: '#B54708', icon: '⚠' },
};

export function NotificationContainer() {
  const [items, setItems] = useState<ToastItem[]>([...toastItems]);
  useEffect(() => {
    const listener: ToastListener = (next) => setItems(next);
    toastListeners.add(listener);
    setItems([...toastItems]);
    return () => { toastListeners.delete(listener); };
  }, []);

  return (
    <div aria-live="polite" aria-relevant="additions removals" className="icg-mock-notifications" style={{ position: 'fixed', zIndex: 10000, top: 16, right: 16, display: 'grid', gap: 8, width: 'min(360px, calc(100vw - 32px))', pointerEvents: 'none' }}>
      {items.map((item) => {
        const colors = toastColors[item.kind];
        return (
          <div key={item.id} role={item.kind === 'error' ? 'alert' : 'status'} style={{ pointerEvents: 'auto', display: 'flex', gap: 10, padding: '12px 14px', background: '#FFFFFF', color: palette.text, border: '1px solid #DFE3E8', borderLeft: `4px solid ${colors.edge}`, borderRadius: 8, boxShadow: '0 8px 24px rgba(9, 30, 66, 0.16)' }}>
            <span style={{ color: colors.edge, fontWeight: 800, fontSize: 16 }}>{colors.icon}</span>
            <span style={{ minWidth: 0, display: 'grid', gap: 3 }}>
              {item.title && <strong style={{ fontSize: 13 }}>{item.title}</strong>}
              {(item.content ?? item.message) && <span style={{ fontSize: 13, lineHeight: 1.4, overflowWrap: 'anywhere' }}>{item.content ?? item.message}</span>}
            </span>
            <button type="button" aria-label="Dismiss notification" onClick={() => { toastItems = toastItems.filter((toast) => toast.id !== item.id); publishToasts(); }} style={{ border: 0, background: 'transparent', color: palette.muted, cursor: 'pointer', marginLeft: 'auto', alignSelf: 'flex-start', fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
        );
      })}
    </div>
  );
}

export interface MockDropdownItemProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

function DropdownItem({ value: _value, children, disabled, onClick, className = '' }: MockDropdownItemProps) {
  return (
    <button type="button" role="option" disabled={disabled} className={`icg-mock-dropdown-item ${className}`.trim()} onClick={onClick} style={{ display: 'block', width: '100%', border: 0, borderRadius: 4, padding: '8px 10px', textAlign: 'left', color: palette.text, background: 'transparent', cursor: disabled ? 'not-allowed' : 'pointer', font: 'inherit', fontSize: 13 }}>
      {children}
    </button>
  );
}

export interface MockDropdownProps {
  children?: ReactNode;
  label?: ReactNode;
  value?: string;
  size?: 'small' | 'default' | 'large' | string;
  disabled?: boolean;
  className?: string;
  onSelect?: (value: string) => void;
}

interface MockDropdownComponent extends React.FC<MockDropdownProps> {
  Item: React.FC<MockDropdownItemProps>;
}

const DropdownRoot: React.FC<MockDropdownProps> = ({ children, label, value, size = 'default', disabled, className = '', onSelect }) => {
  const [open, setOpen] = useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const sizeStyles: Record<string, CSSProperties> = {
    small: { minHeight: 30, padding: '5px 9px', fontSize: 12 },
    default: { minHeight: 36, padding: '7px 10px', fontSize: 13 },
    large: { minHeight: 42, padding: '9px 12px', fontSize: 14 },
  };
  const items = React.Children.map(children, (child) => {
    if (!React.isValidElement<MockDropdownItemProps>(child)) return child;
    return React.cloneElement(child, {
      onClick: () => {
        child.props.onClick?.();
        onSelect?.(child.props.value);
        setOpen(false);
      },
      style: undefined,
    } as Partial<MockDropdownItemProps>);
  });

  return (
    <div ref={rootRef} className={`icg-mock-dropdown ${className}`.trim()} style={{ position: 'relative', display: 'inline-block', minWidth: 150 }}>
      <button type="button" disabled={disabled} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)} style={{ ...controlBase, ...(sizeStyles[size] ?? sizeStyles.default), width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, border: `1px solid ${palette.border}`, background: disabled ? '#F4F5F7' : '#FFFFFF', color: palette.text, cursor: disabled ? 'not-allowed' : 'pointer', textAlign: 'left', opacity: disabled ? 0.6 : 1 }}>
        <span>{label ?? value ?? 'Select an option'}</span><Icon type="chevron-down" size="xs" />
      </button>
      {open && !disabled && (
        <div role="listbox" style={{ position: 'absolute', zIndex: 1000, top: 'calc(100% + 4px)', left: 0, right: 0, maxHeight: 260, overflowY: 'auto', padding: 4, background: '#FFFFFF', border: '1px solid #DFE3E8', borderRadius: 7, boxShadow: '0 8px 22px rgba(9, 30, 66, 0.16)' }}>
          {items}
        </div>
      )}
    </div>
  );
};

export const Dropdown = Object.assign(DropdownRoot, { Item: DropdownItem }) as MockDropdownComponent;

// Include keyframe animation once for consumers that don't import a mock CSS file.
if (typeof document !== 'undefined' && !document.getElementById('icgds-react-mock-style')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'icgds-react-mock-style';
  styleElement.textContent = '@keyframes icg-mock-spin { to { transform: rotate(360deg); } } .icg-mock-button:not(:disabled):hover { filter: brightness(0.97); } .icg-mock-dropdown-item:not(:disabled):hover { background: #F4F7FA !important; }';
  document.head.appendChild(styleElement);
}
