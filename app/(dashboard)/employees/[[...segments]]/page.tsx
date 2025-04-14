// app(dashboard)/employees/[[...segments]]/page.tsx
'use client';
import * as React from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation'; // Import useParams
import { CrudProvider, List, Create, Edit, Show } from '@toolpad/core/Crud';
import {
  employeesDataSource,
  Employee,
  employeesCache,
  employeeSchema, // <-- Import the Zod schema
} from '../../../mocks/employees';
import CustomDataGrid from '../../../components/CustomDataGrid'; // Assuming this component exists

export default function EmployeesCrudPage() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams(); // Use useParams to get route segments

  // Extract segments - note: [[...segments]] captures everything
  // params.segments will be an array like ['employees', '123'] or ['employees', '123', 'edit'] or ['employees', 'new']
  const segments = params.segments || [];
  const actionOrId = segments[1]; // 'new', '123', etc.
  const isEditMode = segments[2] === 'edit';
  const isNewMode = actionOrId === 'new';
  const isListMode = segments.length === 1 && segments[0] === 'employees'; // Or simply check pathname === '/employees'
  const employeeId = !isNewMode && actionOrId ? actionOrId : null; // Get ID if not 'new'


  const rootPath = '/employees'; // Base path for navigation

  const handleRowClick = React.useCallback(
    (id: string | number) => {
      router.push(`${rootPath}/${String(id)}`);
    },
    [router, rootPath],
  );

  const handleCreateClick = React.useCallback(() => {
    router.push(`${rootPath}/new`);
  }, [router, rootPath]);

  const handleEditClick = React.useCallback(
    (id: string | number) => {
      router.push(`${rootPath}/${String(id)}/edit`);
    },
    [router, rootPath],
  );

  // Single handler for navigating back to list on success/delete
  const handleReturnToList = React.useCallback(() => {
    router.push(rootPath);
  }, [router, rootPath]);

  // Determine which view to render
  let content = null;
  if (isListMode || pathname === rootPath) { // Handle base path explicitly
     content = (
        <List<Employee>
          initialPageSize={20}
          onRowClick={handleRowClick}
          onCreateClick={handleCreateClick}
          onEditClick={handleEditClick} // Ensure List component supports this prop if needed directly
          slots={{
            dataGrid: CustomDataGrid,
          }}
          idField="id" // Explicitly state the ID field
        />
     );
  } else if (isNewMode) {
     content = (
        <Create<Employee>
          // Provide initialValues matching the schema fields expected
          initialValues={{ name: '', age: undefined, joinDate: '', role: undefined }}
          onSubmitSuccess={handleReturnToList}
          resetOnSubmit={true} // Usually true for Create forms
          validationSchema={employeeSchema} // <-- Pass the schema
          validationMode="onBlur" // <-- Set validation mode
        />
     );
  } else if (isEditMode && employeeId) {
     content = (
        <Edit<Employee>
          id={employeeId}
          onSubmitSuccess={handleReturnToList}
          validationSchema={employeeSchema} // <-- Pass the schema
          validationMode="onBlur" // <-- Set validation mode
        />
     );
  } else if (employeeId) { // Show mode (must be after edit check)
      content = (
        <Show<Employee>
           id={employeeId}
           onEditClick={handleEditClick}
           onDelete={handleReturnToList}
        />
      );
  }
  // Optionally add a loading state or error handling here

  return (
    // Pass the dataSource and cache to the provider
    <CrudProvider<Employee> dataSource={employeesDataSource} dataSourceCache={employeesCache}>
      {content}
    </CrudProvider>
  );
}