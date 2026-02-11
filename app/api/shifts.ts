import { type Shift } from '~/types/shifts';

export const shiftsApi = {
    list(): Promise<Shift[]> {
        return $fetch('/api/shifts');
    },
    create(shift: Shift): Promise<Shift> {
        return $fetch('/api/shifts', {
            method: 'POST',
            body: shift,
        });
    },
    update(shift: Shift): Promise<Shift> {
        return $fetch(`/api/shifts/${shift.id}`, {
            method: 'PUT',
            body: shift,
        });
    },
    delete(id: number): Promise<void> {
        return $fetch(`/api/shifts/${id}`, {
            method: 'DELETE',
        });
    },
};