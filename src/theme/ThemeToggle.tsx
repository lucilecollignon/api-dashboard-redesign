import { Button, Tooltip } from 'antd';
import { LaptopOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import type { ThemeMode } from './context';
import { useThemeContext } from './context';

const CYCLE: ThemeMode[] = ['auto', 'light', 'dark'];

const LABELS: Record<ThemeMode, string> = {
  auto: 'Mode auto (système)',
  light: 'Mode clair',
  dark: 'Mode sombre',
};

const ICONS: Record<ThemeMode, React.ReactNode> = {
  auto: <LaptopOutlined />,
  light: <SunOutlined />,
  dark: <MoonOutlined />,
};

/**
 * Bouton qui cycle entre les modes `auto → light → dark → auto`.
 * Doit être rendu à l'intérieur d'un `<ThemeProvider>`.
 */
export const ThemeToggle: React.FC = () => {
  const { mode, setMode } = useThemeContext();

  const handleClick = () => {
    const currentIndex = CYCLE.indexOf(mode);
    const nextMode = CYCLE[(currentIndex + 1) % CYCLE.length];
    setMode(nextMode);
  };

  return (
    <Tooltip title={LABELS[mode]}>
      <Button
        type="text"
        icon={ICONS[mode]}
        onClick={handleClick}
        aria-label={LABELS[mode]}
      />
    </Tooltip>
  );
};

export default ThemeToggle;
