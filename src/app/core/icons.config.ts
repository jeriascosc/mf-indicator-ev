import type { EnvironmentProviders } from '@angular/core';
import type { IconDefinition } from '@ant-design/icons-angular';
import {
  CheckCircleOutline,
  CloseCircleOutline,
  DeleteOutline,
  ExclamationCircleOutline,
  InfoCircleOutline,
  PlusOutline,
  QuestionCircleOutline,
  ReloadOutline,
  RiseOutline,
  SearchOutline,
} from '@ant-design/icons-angular/icons';
import { provideNzIcons } from 'ng-zorro-antd/icon';

/**
 * Solo los iconos que la pantalla usa realmente, en lugar del set completo, para no arrastrar
 * cientos de kilobytes de SVG al bundle inicial.
 */
const DASHBOARD_ICONS: IconDefinition[] = [
  RiseOutline,
  PlusOutline,
  ReloadOutline,
  DeleteOutline,
  SearchOutline,
  InfoCircleOutline,
  CheckCircleOutline,
  ExclamationCircleOutline,
  CloseCircleOutline,
  QuestionCircleOutline,
];

export function provideDashboardIcons(): EnvironmentProviders {
  return provideNzIcons(DASHBOARD_ICONS);
}
