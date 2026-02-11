import { type User } from '~/types/users';

export const usersApi = {
    list(): Promise<User[]> {
        return $fetch('/api/users');
    },
    create(user: User): Promise<User> {
        return $fetch('/api/users', {
            method: 'POST',
            body: user,
        });
    },
    update(user: User): Promise<User> {
        return $fetch(`/api/users/${user.id}`, {
            method: 'PUT',
            body: user,
        });
    },
    delete(id: number): Promise<void> {
        return $fetch(`/api/users/${id}`, {
            method: 'DELETE',
        });
    },
    login(): Promise<{ token: string }> {
        return $fetch('/api/auth/login', {
            method: 'POST',
        });
    },
    logout(): Promise<void> {
        return $fetch('/api/logout', {
            method: 'POST',
        });
    }
};