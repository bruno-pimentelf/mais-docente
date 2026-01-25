import { useSlideEditorLayoutStore } from '@/zustand/useSlideEditorLayoutStore';
import {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

export type ContextMenuAction = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
};

type ContextMenuProps = {
  actions: ContextMenuAction[];
};

const ContextMenu = ({ actions }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );

  const contextMenu = useSlideEditorLayoutStore((state) => state.contextMenu);
  const closeContextMenu = useSlideEditorLayoutStore(
    (state) => state.closeContextMenu
  );

  const handleCloseContextMenu = useCallback(() => {
    closeContextMenu();
  }, [closeContextMenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleCloseContextMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleCloseContextMenu]);

  useEffect(() => {
    if (contextMenu?.position) {
      setPosition({ x: contextMenu.position.x, y: contextMenu.position.y });
    }
  }, [contextMenu?.position?.x, contextMenu?.position?.y]);

  useLayoutEffect(() => {
    if (!menuRef.current || !position) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuRect = menuRef.current.getBoundingClientRect();
    const menuWidth = contextMenu?.width ?? 208;
    const menuHeight = menuRect.height;
    const margin = 8;

    const maxX = Math.max(0, viewportWidth - menuWidth - margin);
    const maxY = Math.max(0, viewportHeight - menuHeight - margin);

    const clampedX = Math.min(Math.max(margin, position.x), maxX);
    const clampedY = Math.min(Math.max(margin, position.y), maxY);

    if (clampedX !== position.x || clampedY !== position.y) {
      setPosition({ x: clampedX, y: clampedY });
    }
  }, [position, contextMenu?.width]);

  if (!contextMenu?.position) {
    return null;
  }

  const menu = (
    <div
      ref={menuRef}
      className="fixed z-[9999] rounded-md bg-white shadow-md"
      style={{
        top: (position?.y ?? contextMenu?.position.y) as number,
        left: (position?.x ?? contextMenu?.position.x) as number,
        width: contextMenu?.width ?? 208,
      }}
      onClick={handleCloseContextMenu}
    >
      <ul className="flex flex-col">
        {actions.map((action, index) => (
          <li
            key={index}
            className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={action.onClick}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            {action.icon}
            {action.label}
          </li>
        ))}
      </ul>
    </div>
  );

  return createPortal(menu, document.body);
};

export default ContextMenu;
