class AgentEngineError(Exception):
    """Base exception for LifeOS Agent Engine."""
    pass

class AgentLoopTimeoutError(AgentEngineError):
    """Raised when an agent run exceeds the maximum allowed runtime timeout."""
    pass

class AgentMaxStepsExceededError(AgentEngineError):
    """Raised when an agent run exceeds maxSteps limit (default 10)."""
    pass

class AgentPermissionDeniedError(AgentEngineError):
    """Raised when an agent tool or action requires higher autonomy permission level."""
    pass

class AgentToolExecutionError(AgentEngineError):
    """Raised when a controlled backend tool execution fails."""
    pass

class StaleApprovalError(AgentEngineError):
    """Raised when an approval request has expired or failed constraint revalidation."""
    pass
