import React, { useState } from 'react';
import { ActionButton } from './action-button';
import { LoadingButton } from './loading-button';
import { Save, Download, Copy, Trash2 } from 'lucide-react';

// Test component to verify button functionality
export const ButtonTest: React.FC = () => {
  const [testData] = useState({
    yaml: `pipeline:
  name: "Test Pipeline"
  description: "Test pipeline for button functionality"
  stages:
    - name: "main"
      steps:
        - name: "Test Step"
          type: "test-step"`,
    name: "test-pipeline"
  });

  const handleSave = async () => {
    // Simulate async save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Save completed');
  };

  const handleError = async () => {
    // Simulate error
    await new Promise(resolve => setTimeout(resolve, 500));
    throw new Error('Test error');
  };

  const handleDelete = async () => {
    // Simulate delete operation
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('Delete completed');
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Button Functionality Test</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Action Buttons</h3>
          <div className="flex gap-2">
            <ActionButton
              action="save"
              onAction={handleSave}
              successMessage="Test save successful!"
              errorMessage="Test save failed!"
            >
              Test Save
            </ActionButton>

            <ActionButton
              action="export"
              data={testData}
              successMessage="Test export successful!"
              errorMessage="Test export failed!"
            >
              Test Export
            </ActionButton>

            <ActionButton
              action="copy"
              data={testData.yaml}
              successMessage="Test copy successful!"
              errorMessage="Test copy failed!"
            >
              Test Copy
            </ActionButton>

            <ActionButton
              action="delete"
              onAction={handleDelete}
              confirmAction={true}
              confirmMessage="Are you sure you want to test delete?"
              successMessage="Test delete successful!"
              errorMessage="Test delete failed!"
            >
              Test Delete
            </ActionButton>

            <ActionButton
              action="custom"
              onAction={handleError}
              icon={Save}
              successMessage="This shouldn't show"
              errorMessage="Expected test error!"
            >
              Test Error
            </ActionButton>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Loading Buttons</h3>
          <div className="flex gap-2">
            <LoadingButton
              onClick={handleSave}
              icon={Save}
            >
              Loading Test
            </LoadingButton>

            <LoadingButton
              onClick={handleError}
              icon={Download}
            >
              Error Test
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonTest;