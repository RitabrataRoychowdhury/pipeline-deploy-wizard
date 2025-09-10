import React, { useState, useCallback, useEffect } from 'react';
import { Node, Edge, ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import { PipelineNode, PipelineEdge } from '@/lib/pipeline-utils';
import { ValidationStatus } from '@/components/ValidationStatus';
import { ErrorBoundary, useErrorHandler } from '@/components/ErrorBoundary';
import { useAutoSave, useSaveStatus, useSaveShortcuts, useUnsavedChangesWarning } from '@/hooks/useAutoSave';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Save, Download, Upload, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PipelineBuilderWithValidationProps {
  initialNodes?: PipelineNode[];
  initialEdges?: PipelineEdge[];
  pipelineId?: string;
  pipelineName?: string;
  onSave?: (nodes: PipelineNode[], edges: PipelineEdge[]) => void;
  onExport?: (nodes: PipelineNode[], edges: PipelineEdge[]) => void;
}

export function PipelineBuilderWithValidation({
  initialNodes = [],
  initialEdges = [],
  pipelineId = 'default',
  pipelineName = 'Untitled Pipeline',
  onSave,
  onExport,
}: PipelineBuilderWithValidationProps) {
  const [nodes, setNodes] = useState<PipelineNode[]>(initialNodes);
  const [edges, setEdges] = useState<PipelineEdge[]>(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  const { handleError, handleAsyncError } = useErrorHandler();
  
  // Auto-save functionality
  const {
    saveState,
    updateData,
    save: autoSave,
    loadData,
    startAutoSave,
    stopAutoSave,
  } = useAutoSave({
    pipelineId,
    pipelineName,
    enabled: true,
    interval: 30000, // 30 seconds
    storageType: 'localStorage',
    onSaveStateChange: (state) => {
      console.log('Save state changed:', state);
    },
  });

  const { statusText, statusColor } = useSaveStatus();

  // Update auto-save data when nodes or edges change
  useEffect(() => {
    updateData(nodes, edges);
  }, [nodes, edges, updateData]);

  // Keyboard shortcuts
  useSaveShortcuts(() => handleManualSave());
  
  // Unsaved changes warning
  useUnsavedChangesWarning(saveState.hasUnsavedChanges);

  // Handle manual save
  const handleManualSave = useCallback(async () => {
    const success = await handleAsyncError(async () => {
      const result = await autoSave(false);
      if (result && onSave) {
        onSave(nodes, edges);
      }
      return result;
    }, { action: 'manualSave' });

    if (success) {
      toast({
        title: 'Pipeline Saved',
        description: 'Your pipeline has been saved successfully.',
      });
    }
  }, [autoSave, nodes, edges, onSave, handleAsyncError]);

  // Handle export
  const handleExport = useCallback(async () => {
    await handleAsyncError(async () => {
      if (onExport) {
        onExport(nodes, edges);
      }
      
      // Also trigger a save before export
      await autoSave(false);
      
      toast({
        title: 'Pipeline Exported',
        description: 'Your pipeline has been exported successfully.',
      });
    }, { action: 'export' });
  }, [nodes, edges, onExport, autoSave, handleAsyncError]);

  // Handle load
  const handleLoad = useCallback(async () => {
    const data = await handleAsyncError(async () => {
      return await loadData(pipelineId);
    }, { action: 'load' });

    if (data) {
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      
      toast({
        title: 'Pipeline Loaded',
        description: 'Your pipeline has been loaded successfully.',
      });
    }
  }, [loadData, pipelineId, handleAsyncError]);

  // Handle validation auto-fix
  const handleAutoFix = useCallback((fixedNodes: PipelineNode[], fixedEdges: PipelineEdge[]) => {
    setNodes(fixedNodes);
    setEdges(fixedEdges);
    
    toast({
      title: 'Issues Auto-Fixed',
      description: 'Validation issues have been automatically resolved.',
    });
  }, []);

  // Handle node selection from validation
  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    
    // Scroll to node or highlight it
    const nodeElement = document.querySelector(`[data-id="${nodeId}"]`);
    if (nodeElement) {
      nodeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Get save status icon
  const getSaveStatusIcon = () => {
    if (saveState.isSaving) {
      return <Clock className="w-4 h-4 animate-pulse" />;
    }
    
    if (saveState.saveError) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    
    if (saveState.hasUnsavedChanges) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <Card className="rounded-none border-x-0 border-t-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{pipelineName}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  {getSaveStatusIcon()}
                  <span className={`text-sm ${statusColor}`}>{statusText}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button onClick={handleLoad} variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Load
                </Button>
                
                <Button onClick={handleManualSave} variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                
                <Button onClick={handleExport} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Pipeline Canvas */}
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={(changes) => {
                // Handle node changes
                console.log('Nodes changed:', changes);
              }}
              onEdgesChange={(changes) => {
                // Handle edge changes
                console.log('Edges changed:', changes);
              }}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>

          {/* Validation Panel */}
          <div className="w-80 border-l bg-background overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Save Status */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Save Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {getSaveStatusIcon()}
                    <span className="text-sm">{statusText}</span>
                  </div>
                  
                  {saveState.saveError && (
                    <Alert className="mt-2" variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {saveState.saveError}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {saveState.conflictDetected && (
                    <Alert className="mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Conflict detected. Please resolve before continuing.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Separator />

              {/* Validation Status */}
              <ValidationStatus
                nodes={nodes}
                edges={edges}
                onAutoFix={handleAutoFix}
                onNodeSelect={handleNodeSelect}
                compact={false}
              />

              {/* Pipeline Stats */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Pipeline Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Nodes:</span>
                    <Badge variant="secondary">{nodes.length}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Connections:</span>
                    <Badge variant="secondary">{edges.length}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Selected:</span>
                    <Badge variant={selectedNodeId ? "default" : "outline"}>
                      {selectedNodeId || 'None'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default PipelineBuilderWithValidation;