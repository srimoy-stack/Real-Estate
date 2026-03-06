"use client";

import React from 'react';
import { RoleGuard } from './roleGuard';
import { Role } from './authTypes';

/**
 * Higher-Order Component version of the role guard.
 * Wrap your page component export with this function.
 */
export function withAuth<T extends object>(
    WrappedComponent: React.ComponentType<T>,
    allowedRoles: Role[] = Object.values(Role) // default is any valid role
) {
    return function WithAuthWrapper(props: T) {
        return (
            <RoleGuard allowedRoles={allowedRoles}>
                <WrappedComponent {...props} />
            </RoleGuard>
        );
    };
}
