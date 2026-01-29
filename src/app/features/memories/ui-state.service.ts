import { Injectable } from '@angular/core';

export type MemoriesView = 'nodos' | 'calendario';
export type GroupsExpanded = { amigos: boolean; familia: boolean; mascota: boolean; otros: boolean };

@Injectable({ providedIn: 'root' })
export class MemoriesUiStateService {
  view: MemoriesView = 'nodos';
  nodes = {
    showMenu: false,
    expanded: { amigos: false, familia: false, mascota: false, otros: false } as GroupsExpanded
  };
  calendar = {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    overlayOpen: false,
    overlayItemsIds: [] as string[],
    overlayPos: { x: 0, y: 0 }
  };

  setView(v: MemoriesView) {
    this.view = v;
  }
  setNodes(state: { showMenu: boolean; expanded: GroupsExpanded }) {
    this.nodes = { showMenu: state.showMenu, expanded: { ...state.expanded } };
  }
  setCalendarMonth(year: number, month: number) {
    this.calendar.year = year;
    this.calendar.month = month;
  }
  setOverlay(open: boolean, ids: string[], pos: { x: number; y: number }) {
    this.calendar.overlayOpen = open;
    this.calendar.overlayItemsIds = ids.slice();
    this.calendar.overlayPos = pos;
  }
  clearOverlay() {
    this.calendar.overlayOpen = false;
    this.calendar.overlayItemsIds = [];
  }
  backLink() {
    return this.view === 'calendario' ? '/app/recuerdos/calendario' : '/app/recuerdos/nodos';
  }
}
