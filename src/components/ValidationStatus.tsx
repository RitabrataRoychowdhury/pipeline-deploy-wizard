import React, { useState, useEffect } from 'react';
import { PipelineNode, PipelineEdge } from '@/lib/pipeline-utils';
import { pipelineValidator, ValidationIssue, PipelineValidationResult } from '@/lib/validation';
import { ErrorHandler } from '@/lib/error-handling';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  ChevronDown, 
  ChevronRight,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';

interface ValidationStatusProps {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  onAutoFix?: (fixedNodes: PipelineNode[], fixedEdges: PipelineEdge[]) => void;
  onNodeSelect?: (nodeId: string) => void;
  className?: string;
  compact?: boolean;
}

interface ValidationState {
  result: PipelineValidationResult | null;
  isValidating: boolean;
  lastValidated: Date | null;
  autoValidate: boolean;
}

export function ValidationStatus({
  nodes,
  edges,
  onAutoFix,
  onNodeSelect,
  className,
  compact = false
}: ValidationStatusProps) {
  const [validationState, setValidationState] = useState<ValidationState>({
    result: null,
    isValidating: false,
    lastValidated: null,
    autoValidate: true,
  });

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['errors']));
  const [showDetails, setShowDetails] = useState(!compact);

  // Validate pipeline when nodes or edges change
  useEffect(() => {
    if (validationState.autoValidate) {
      validatePipeline();
    }
  }, [nodes, edges, validationState.autoValidate]);

  const validatePipeline = async () => {
    setValidationState(prev => ({ ...prev, isValidating: true }));

    try {
      const result = pipelineValidator.validatePipeline(nodes, edges);
      setValidationState(prev => ({
        ...prev,
        result,
        isValidating: false,
        lastValidated: new Date(),
      }));
    } catch (error) {
      ErrorHandler.getInstance().handleError(error as Error, {
        component: 'ValidationStatus',
        action: 'validatePipeline',
        timestamp: new Date(),
      });
      
      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        result: {
          isValid: false,
          errors: ['Validation failed due to an internal error'],
          warnings: [],
          nodeValidations: [],
          issues: [],
          canAutoFix: false,
          fixableIssues: [],
        },
      }));
    }
  };

  const handleAutoFix = async () => {
    if (!validationState.result || !onAutoFix) return;

    try {
      const { nodes: fixedNodes, edges: fixedEdges, fixedIssues } = pipelineValidator.autoFixIssues(
        nodes,
        edges,
        validationState.result.fixableIssues
      );

      onAutoFix(fixedNodes, fixedEdges);

      // Show success message
      if (fixedIssues.length > 0) {
        console.log(`Auto-fixed ${fixedIssues.length} issues:`, fixedIssues);
      }
    } catch (error) {
      ErrorHandler.getInstance().handleError(error as Error, {
        component: 'ValidationStatus',
        action: 'autoFix',
        timestamp: new Date(),
      });
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const getStatusIcon = () => {
    if (validationState.isValidating) {
      return <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />;
    }

    if (!validationState.result) {
      return <Info className="w-4 h-4 text-muted-foreground" />;
    }

    if (validationState.result.isValid) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }

    if (validationState.result.errors.length > 0) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }

    return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (validationState.isValidating) {
      return 'Validating...';
    }

    if (!validationState.result) {
      return 'Not validated';
    }

    if (validationState.result.isValid) {
      return 'Pipeline is valid';
    }

    const errorCount = validationState.result.errors.length;
    const warningCount = validationState.result.warnings.length;

    if (errorCount > 0) {
      return `${errorCount} error${errorCount !== 1 ? 's' : ''}${warningCount > 0 ? `, ${warningCount} warning${warningCount !== 1 ? 's' : ''}` : ''}`;
    }

    return `${warningCount} warning${warningCount !== 1 ? 's' : ''}`;
  };

  const getStatusVariant = (): 'default' | 'secondary' | 'destructive' => {
    if (!validationState.result || validationState.result.isValid) {
      return 'default';
    }
    return validationState.result.errors.length > 0 ? 'destructive' : 'secondary';
  };

  const renderIssueList = (issues: ValidationIssue[], title: string, icon: React.ReactNode) => {
    if (issues.length === 0) return null;

    const sectionKey = title.toLowerCase();
    const isExpanded = expandedSections.has(sectionKey);

    return (
      <div className="space-y-2">
        <Collapsible open={isExpanded} onOpenChange={() => toggleSection(sectionKey)}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-2 h-auto">
              <div className="flex items-center gap-2">
                {icon}
                <span className="font-medium">{title}</span>
                <Badge variant="secondary">{issues.length}</Badge>
              </div>
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <ScrollArea className="max-h-48">
              <div className="space-y-2 p-2">
                {issues.map((issue, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border bg-card text-card-foreground"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{issue.message}</p>
                        {issue.suggestion && (
                          <p className="text-xs text-muted-foreground">{issue.suggestion}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Rule: {issue.rule}</span>
                          {issue.autoFixable && (
                            <Badge variant="outline" className="text-xs">
                              Auto-fixable
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {issue.nodeId && onNodeSelect && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onNodeSelect(issue.nodeId!)}
                          className="shrink-0"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {getStatusIcon()}
        <span className="text-sm">{getStatusText()}</span>
        {validationState.result?.canAutoFix && (
          <Button size="sm" variant="outline" onClick={handleAutoFix}>
            <Zap className="w-3 h-3 mr-1" />
            Fix
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">Validation Status</CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={validatePipeline}
              disabled={validationState.isValidating}
            >
              Validate
            </Button>
          </div>
        </div>
        
        <CardDescription>
          <div className="flex items-center justify-between">
            <span>{getStatusText()}</span>
            {validationState.lastValidated && (
              <span className="text-xs">
                Last checked: {validationState.lastValidated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </CardDescription>
      </CardHeader>

      {showDetails && validationState.result && (
        <CardContent className="space-y-4">
          {/* Overall Status */}
          <Alert variant={validationState.result.isValid ? 'default' : 'destructive'}>
            {validationState.result.isValid ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {validationState.result.isValid ? 'Pipeline Valid' : 'Validation Issues Found'}
            </AlertTitle>
            <AlertDescription>
              {validationState.result.isValid
                ? 'Your pipeline configuration is valid and ready to use.'
                : 'Please review and fix the issues below before proceeding.'
              }
            </AlertDescription>
          </Alert>

          {/* Auto-fix Option */}
          {validationState.result.canAutoFix && (
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertTitle>Auto-fix Available</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>
                  {validationState.result.fixableIssues.length} issue{validationState.result.fixableIssues.length !== 1 ? 's' : ''} can be automatically fixed.
                </span>
                <Button size="sm" onClick={handleAutoFix}>
                  <Zap className="w-3 h-3 mr-1" />
                  Auto-fix Issues
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Issues Lists */}
          <div className="space-y-4">
            {renderIssueList(
              validationState.result.issues.filter(issue => issue.severity === 'error'),
              'Errors',
              <XCircle className="w-4 h-4 text-red-500" />
            )}

            {renderIssueList(
              validationState.result.issues.filter(issue => issue.severity === 'warning'),
              'Warnings',
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            )}

            {renderIssueList(
              validationState.result.issues.filter(issue => issue.severity === 'info'),
              'Suggestions',
              <Info className="w-4 h-4 text-blue-500" />
            )}
          </div>

          {/* Node Validation Summary */}
          {validationState.result.nodeValidations.length > 0 && (
            <div className="space-y-2">
              <Separator />
              <Collapsible 
                open={expandedSections.has('nodes')} 
                onOpenChange={() => toggleSection('nodes')}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Node Validation</span>
                      <Badge variant="secondary">
                        {validationState.result.nodeValidations.filter(n => !n.isValid).length} issues
                      </Badge>
                    </div>
                    {expandedSections.has('nodes') ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronRight className="w-4 h-4" />
                    }
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <ScrollArea className="max-h-32">
                    <div className="space-y-1 p-2">
                      {validationState.result.nodeValidations.map((nodeValidation) => (
                        <div
                          key={nodeValidation.nodeId}
                          className="flex items-center justify-between p-2 rounded border"
                        >
                          <div className="flex items-center gap-2">
                            {nodeValidation.isValid ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-500" />
                            )}
                            <span className="text-sm font-mono">{nodeValidation.nodeId}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {nodeValidation.errors.length > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {nodeValidation.errors.length} errors
                              </Badge>
                            )}
                            {nodeValidation.warnings.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {nodeValidation.warnings.length} warnings
                              </Badge>
                            )}
                            {onNodeSelect && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onNodeSelect(nodeValidation.nodeId)}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Auto-validation Toggle */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">Auto-validate on changes</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setValidationState(prev => ({ 
                ...prev, 
                autoValidate: !prev.autoValidate 
              }))}
            >
              {validationState.autoValidate ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default ValidationStatus;