// app/mocks/employees.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    employeesDataSource,
    Employee,
    // INITIAL_EMPLOYEES_STORE is intentionally not imported as it's not exported
} from './employees'; // Adjust path if needed
// Import types needed for getMany arguments
import type { GridFilterModel, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';

// Define a copy of the initial data for test setup/assertions
const testInitialEmployees: Employee[] = [
    { id: 1, name: 'Edward Perry', age: 25, joinDate: new Date(2024, 0, 1).toISOString(), role: 'Finance' },
    { id: 2, name: 'Josephine Drake', age: 36, joinDate: new Date(2024, 1, 15).toISOString(), role: 'Market' },
    { id: 3, name: 'Cody Phillips', age: 19, joinDate: new Date(2024, 2, 20).toISOString(), role: 'Development' },
];

// Helper functions
const setLocalStorage = (data: Employee[]) => {
    if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('employees-store', JSON.stringify(data));
    }
};
const getLocalStorage = (): Employee[] => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const value = window.localStorage.getItem('employees-store');
        try { return value ? JSON.parse(value) : []; } catch (e) { return []; }
    }
    return [];
};

describe('Employees Data Source', () => {
    beforeEach(() => {
        // FIX: Removed the check for INITIAL_EMPLOYEES_STORE
        // Simply use the local testInitialEmployees to set up localStorage
        setLocalStorage([...testInitialEmployees]); // Use a fresh copy for each test
        vi.useRealTimers(); // Ensure timers are real for async operations
    });

    afterEach(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.clear();
        }
        vi.restoreAllMocks(); // Restore any mocks if used
    });

    // --- getMany ---
    describe('getMany', () => {
        it('should return initial employees without filters/pagination', async () => {
            const result = await employeesDataSource.getMany!({
                paginationModel: { page: 0, pageSize: 10 },
                sortModel: [],
                filterModel: { items: [] }
            });
            // Use toEqual for deep comparison of arrays/objects
            expect(result.items).toEqual(testInitialEmployees);
            expect(result.itemCount).toBe(testInitialEmployees.length);
        });

        it('should apply pagination correctly', async () => {
            const result = await employeesDataSource.getMany!({
                paginationModel: { page: 0, pageSize: 1 },
                sortModel: [],
                filterModel: { items: [] }
            });
            expect(result.items).toHaveLength(1);
            expect(result.items[0].id).toBe(testInitialEmployees[0].id);
            expect(result.itemCount).toBe(testInitialEmployees.length);

            const resultPage2 = await employeesDataSource.getMany!({
                paginationModel: { page: 1, pageSize: 1 },
                sortModel: [],
                filterModel: { items: [] }
            });
            expect(resultPage2.items).toHaveLength(1);
            expect(resultPage2.items[0].id).toBe(testInitialEmployees[1].id);
            expect(resultPage2.itemCount).toBe(testInitialEmployees.length);
        });

        it('should filter by name (contains)', async () => {
            const result = await employeesDataSource.getMany!({
                paginationModel: { page: 0, pageSize: 10 },
                filterModel: { items: [{ field: 'name', operator: 'contains', value: 'Perry' }] },
                sortModel: []
            });
            expect(result.items).toHaveLength(1);
            expect(result.items[0].name).toBe('Edward Perry');
            expect(result.itemCount).toBe(1); // itemCount should reflect filtered count
        });

        it('should filter by role (equals)', async () => {
             const result = await employeesDataSource.getMany!({
                 paginationModel: { page: 0, pageSize: 10 },
                 filterModel: { items: [{ field: 'role', operator: 'equals', value: 'Market' }] },
                 sortModel: []
             });
             expect(result.items).toHaveLength(1);
             expect(result.items[0].role).toBe('Market');
             expect(result.itemCount).toBe(1); // itemCount should reflect filtered count
        });

         it('should filter by age (>)', async () => {
            const result = await employeesDataSource.getMany!({
                paginationModel: { page: 0, pageSize: 10 },
                filterModel: { items: [{ field: 'age', operator: '>', value: 30 }] },
                sortModel: []
            });
            expect(result.items).toHaveLength(1);
            expect(result.items[0].age).toBe(36);
            expect(result.itemCount).toBe(1); // itemCount should reflect filtered count
        });

        it('should sort by age (asc)', async () => {
            const result = await employeesDataSource.getMany!({
                paginationModel: { page: 0, pageSize: 10 },
                sortModel: [{ field: 'age', sort: 'asc' }],
                filterModel: { items: [] }
            });
            expect(result.items.map(e => e.age)).toEqual([19, 25, 36]);
            expect(result.itemCount).toBe(testInitialEmployees.length);
        });

         it('should sort by name (desc)', async () => {
            const result = await employeesDataSource.getMany!({
                paginationModel: { page: 0, pageSize: 10 },
                sortModel: [{ field: 'name', sort: 'desc' }],
                filterModel: { items: [] }
            });
            expect(result.items.map(e => e.name)).toEqual(['Josephine Drake', 'Edward Perry', 'Cody Phillips']);
            expect(result.itemCount).toBe(testInitialEmployees.length);
        });
         // Consider adding tests for date filtering/sorting
    }); // End describe('getMany')

    // --- getOne ---
    describe('getOne', () => {
        it('should return the correct employee for a valid ID', async () => {
            const employee = await employeesDataSource.getOne!(2);
            expect(employee).toBeDefined();
            expect(employee.id).toBe(2);
            expect(employee.name).toBe('Josephine Drake');
            // Use toEqual for deep comparison if needed, but properties are fine here
            expect(employee).toEqual(testInitialEmployees[1]);
        });

        it('should throw an error for an invalid ID', async () => {
            await expect(employeesDataSource.getOne!(999)).rejects.toThrow('Employee not found');
        });
    }); // End describe('getOne')

    // --- createOne ---
    describe('createOne', () => {
        it('should add a new employee and return it', async () => {
            const initialLength = getLocalStorage().length;
            const newEmployeeData = {
                name: 'Jane Doe',
                age: 30,
                joinDate: new Date(2024, 3, 1).toISOString(), // Ensure valid ISO string
                role: 'Finance' as const,
            };
            const createdEmployee = await employeesDataSource.createOne!(newEmployeeData);
            const expectedNewId = testInitialEmployees.reduce((max, e) => Math.max(max, e.id), 0) + 1;

            expect(createdEmployee.id).toBe(expectedNewId);
            expect(createdEmployee.name).toBe(newEmployeeData.name);
            expect(createdEmployee.age).toBe(newEmployeeData.age);
            expect(createdEmployee.joinDate).toBe(newEmployeeData.joinDate);
            expect(createdEmployee.role).toBe(newEmployeeData.role);

            // Verify it was added to storage
            const storedEmployees = getLocalStorage();
            expect(storedEmployees).toHaveLength(initialLength + 1);
            const added = storedEmployees.find(e => e.id === expectedNewId);
            expect(added).toEqual(createdEmployee); // Check if the added one matches returned
        });

        it('should throw validation error for invalid create data', async () => {
             const invalidData = { name: 'Bad', age: 15 }; // Missing fields, invalid age
             // createOne itself throws ZodError before creating
             await expect(employeesDataSource.createOne!(invalidData as any))
                 .rejects.toThrow(); // Or expect().rejects.toBeInstanceOf(ZodError) if ZodError is accessible/imported
             // Ensure storage wasn't modified
             expect(getLocalStorage()).toHaveLength(testInitialEmployees.length);
        });
    }); // End describe('createOne')

    // --- updateOne ---
    describe('updateOne', () => {
        it('should update an existing employee and return it', async () => {
            const employeeIdToUpdate = 1;
            const updatedData = { age: 26, role: 'Development' as const };
            const originalEmployee = testInitialEmployees.find(e => e.id === employeeIdToUpdate)!;

            const updatedEmployee = await employeesDataSource.updateOne!(employeeIdToUpdate, updatedData);

            expect(updatedEmployee.id).toBe(employeeIdToUpdate);
            expect(updatedEmployee.name).toBe(originalEmployee.name); // Name shouldn't change
            expect(updatedEmployee.age).toBe(updatedData.age); // Age should change
            expect(updatedEmployee.joinDate).toBe(originalEmployee.joinDate); // Date shouldn't change
            expect(updatedEmployee.role).toBe(updatedData.role); // Role should change

            // Verify storage
            const storedEmployees = getLocalStorage();
            const updatedInStorage = storedEmployees.find(e => e.id === employeeIdToUpdate);
            expect(updatedInStorage).toEqual(updatedEmployee);
        });

        it('should throw an error if employee to update is not found', async () => {
            await expect(employeesDataSource.updateOne!(999, { age: 50 }))
                .rejects.toThrow('Employee not found');
        });

        it('should throw validation error for invalid update data', async () => {
             const employeeIdToUpdate = 1;
             const invalidUpdateData = { age: 10 }; // Invalid age
             // updateOne throws ZodError if merged data is invalid
             await expect(employeesDataSource.updateOne!(employeeIdToUpdate, invalidUpdateData))
                 .rejects.toThrow(); // Or .rejects.toBeInstanceOf(ZodError)

             // Ensure original data is still in storage
             const storedEmployee = getLocalStorage().find(e => e.id === employeeIdToUpdate);
             expect(storedEmployee?.age).toBe(testInitialEmployees.find(e=> e.id === employeeIdToUpdate)?.age); // Should not be 10
        });
    }); // End describe('updateOne')

    // --- deleteOne ---
    describe('deleteOne', () => {
        it('should remove an employee from the store', async () => {
            const employeeIdToDelete = 3;
            const initialLength = getLocalStorage().length;

            await employeesDataSource.deleteOne!(employeeIdToDelete);

            const storedEmployees = getLocalStorage();
            expect(storedEmployees).toHaveLength(initialLength - 1);
            expect(storedEmployees.find(e => e.id === employeeIdToDelete)).toBeUndefined();
        });

        it('should not throw error and not change store if employee to delete is not found', async () => {
            const employeeIdToDelete = 999;
            const initialLength = getLocalStorage().length;

            // deleteOne should resolve gracefully if not found
            await expect(employeesDataSource.deleteOne!(employeeIdToDelete)).resolves.toBeUndefined();

            // Verify storage length hasn't changed
            expect(getLocalStorage()).toHaveLength(initialLength);
        });
    }); // End describe('deleteOne')


    // --- validate ---
    describe('validate', () => {
        const validBaseData = {
            name: 'Valid Name',
            age: 25,
            joinDate: new Date().toISOString(),
            role: 'Market' as const,
        };

        it('should return result with value for valid input', () => {
             // FIX: Check the return value, don't expect throw
             const result = employeesDataSource.validate!(validBaseData);
             expect(result.error).toBeUndefined();
             expect(result.value).toEqual(validBaseData); // Or expect.objectContaining(validBaseData)
        });

        it('should return result with error for missing name', () => {
            const invalidData = { ...validBaseData, name: '' };
            // FIX: Check the return value
            const result = employeesDataSource.validate!(invalidData);
            expect(result.value).toBeUndefined();
            expect(result.error).toBeDefined();
            expect(result.error).toContain('name: Name is required'); // Check specific error message
        });

        it('should return result with error for age less than 18', () => {
            const invalidData = { ...validBaseData, age: 17 };
            // FIX: Check the return value
            const result = employeesDataSource.validate!(invalidData);
            expect(result.value).toBeUndefined();
            expect(result.error).toBeDefined();
            expect(result.error).toContain('age: Age must be at least 18');
        });

        it('should return result with error for invalid role', () => {
            const invalidData = { ...validBaseData, role: 'InvalidRole' as any };
            // FIX: Check the return value
            const result = employeesDataSource.validate!(invalidData);
            expect(result.value).toBeUndefined();
            expect(result.error).toBeDefined();
            expect(result.error).toContain('role: Role must be "Market", "Finance" or "Development"');
        });

        it('should return result with error for missing joinDate', () => {
            const invalidData = { ...validBaseData, joinDate: '' };
             // FIX: Check the return value
            const result = employeesDataSource.validate!(invalidData);
            expect(result.value).toBeUndefined();
            expect(result.error).toBeDefined();
            expect(result.error).toContain('joinDate: Join date is required');
        });

        it('should return result with error for invalid joinDate format', () => {
            const invalidData = { ...validBaseData, joinDate: 'not-a-date' };
             // FIX: Check the return value
            const result = employeesDataSource.validate!(invalidData);
            expect(result.value).toBeUndefined();
            expect(result.error).toBeDefined();
            expect(result.error).toContain('joinDate: Invalid ISO date format required');
        });
    }); // End describe('validate')

}); // End describe('Employees Data Source')