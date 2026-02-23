"""
Custom CloudWatch Metrics Module for SkillScout
Emits business-specific metrics for application monitoring and analytics.

Metrics Tracked:
- Question retrieval and viewing patterns
- Admin CRUD operations and authorization
- AI evaluation usage and success rates
- User engagement and search behavior
- System performance indicators
"""

import boto3
import logging
from datetime import datetime
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)
cloudwatch = boto3.client("cloudwatch")

# Namespace for all SkillScout custom metrics
NAMESPACE = "SkillScout"


def emit_metric(
    metric_name: str,
    value: float,
    unit: str = "Count",
    dimensions: Optional[List[Dict[str, str]]] = None,
) -> None:
    """
    Emit a custom CloudWatch metric.

    Args:
        metric_name: Name of the metric
        value: Metric value
        unit: Unit type (Count, Seconds, Milliseconds, Bytes, etc.)
        dimensions: Optional list of dimension dicts [{'Name': 'x', 'Value': 'y'}]
    """
    try:
        metric_data = {
            "MetricName": metric_name,
            "Value": value,
            "Unit": unit,
            "Timestamp": datetime.utcnow(),
        }

        if dimensions:
            metric_data["Dimensions"] = dimensions

        cloudwatch.put_metric_data(Namespace=NAMESPACE, MetricData=[metric_data])

        logger.info(f"Emitted metric: {metric_name}={value} {unit}", extra={
            "metric_name": metric_name,
            "value": value,
            "unit": unit,
            "dimensions": dimensions
        })

    except Exception as e:
        # Don't fail the Lambda if metrics fail - graceful degradation
        logger.warning(f"Failed to emit metric {metric_name}: {str(e)}")


class QuestionsMetrics:
    """Metrics for questions_handler Lambda"""

    @staticmethod
    def questions_retrieved(count: int) -> None:
        """Track number of questions retrieved in a single request"""
        emit_metric("QuestionsRetrieved", count, "Count")

    @staticmethod
    def question_viewed(question_id: str, category: Optional[str] = None, difficulty: Optional[str] = None) -> None:
        """Track individual question views with category/difficulty breakdown"""
        dimensions = []

        if category:
            dimensions.append({"Name": "Category", "Value": category})

        if difficulty:
            dimensions.append({"Name": "Difficulty", "Value": difficulty})

        emit_metric("QuestionViewed", 1, "Count", dimensions)

    @staticmethod
    def question_not_found() -> None:
        """Track 404 errors for questions"""
        emit_metric("QuestionNotFound", 1, "Count")

    @staticmethod
    def api_latency(latency_ms: float, operation: str) -> None:
        """Track API operation latency"""
        dimensions = [{"Name": "Operation", "Value": operation}]
        emit_metric("APILatency", latency_ms, "Milliseconds", dimensions)

    @staticmethod
    def search_performed(result_count: int, has_filters: bool = False) -> None:
        """Track search operations and result counts"""
        emit_metric("SearchPerformed", 1, "Count")
        emit_metric("SearchResultCount", result_count, "Count")

        if has_filters:
            emit_metric("FilteredSearch", 1, "Count")


class AdminMetrics:
    """Metrics for admin operations and authorization"""

    @staticmethod
    def admin_operation(operation: str, success: bool) -> None:
        """
        Track admin CRUD operations (CREATE, UPDATE, DELETE).

        Args:
            operation: Operation type (CREATE, UPDATE, DELETE)
            success: Whether operation succeeded
        """
        dimensions = [
            {"Name": "Operation", "Value": operation},
            {"Name": "Success", "Value": str(success)}
        ]
        emit_metric("AdminOperation", 1, "Count", dimensions)

    @staticmethod
    def question_created(category: str) -> None:
        """Track question creation by category"""
        dimensions = [{"Name": "Category", "Value": category}]
        emit_metric("QuestionCreated", 1, "Count", dimensions)

    @staticmethod
    def question_updated(question_id: str) -> None:
        """Track question updates"""
        emit_metric("QuestionUpdated", 1, "Count")

    @staticmethod
    def question_deleted(question_id: str) -> None:
        """Track question deletions"""
        emit_metric("QuestionDeleted", 1, "Count")

    @staticmethod
    def unauthorized_admin_access(user_sub: str, operation: str) -> None:
        """
        Track unauthorized admin access attempts for security monitoring.

        Args:
            user_sub: User ID attempting access
            operation: Operation they attempted (POST, PUT, DELETE)
        """
        dimensions = [{"Name": "Operation", "Value": operation}]
        emit_metric("UnauthorizedAdminAccess", 1, "Count", dimensions)

        logger.warning("Unauthorized admin access attempt", extra={
            "user_sub": user_sub,
            "operation": operation
        })

    @staticmethod
    def admin_authorization_check(is_admin: bool) -> None:
        """Track admin authorization checks"""
        dimensions = [{"Name": "IsAdmin", "Value": str(is_admin)}]
        emit_metric("AdminAuthCheck", 1, "Count", dimensions)


class EvaluationMetrics:
    """Metrics for evaluate_answer Lambda (Marcus AI)"""

    @staticmethod
    def answer_evaluated(score: int, is_correct: bool) -> None:
        """Track answer evaluations with score and correctness"""
        # Overall evaluation count
        emit_metric("AnswerEvaluated", 1, "Count")

        # Score tracking
        emit_metric("EvaluationScore", score, "None")

        # Correctness tracking
        correctness_dim = [{"Name": "IsCorrect", "Value": str(is_correct)}]
        emit_metric("AnswerCorrectness", 1, "Count", correctness_dim)

    @staticmethod
    def evaluation_success() -> None:
        """Track successful AI evaluations"""
        emit_metric("EvaluationSuccess", 1, "Count")

    @staticmethod
    def evaluation_failure(error_type: str) -> None:
        """Track failed evaluations with error type"""
        dimensions = [{"Name": "ErrorType", "Value": error_type}]
        emit_metric("EvaluationFailure", 1, "Count", dimensions)

    @staticmethod
    def ai_response_time(duration_ms: float) -> None:
        """Track Marcus AI response latency"""
        emit_metric("MarcusResponseTime", duration_ms, "Milliseconds")

    @staticmethod
    def user_engagement(score: int) -> None:
        """
        Track user engagement level based on score ranges.
        High: 80-100, Medium: 50-79, Low: 0-49
        """
        if score >= 80:
            level = "High"
        elif score >= 50:
            level = "Medium"
        else:
            level = "Low"

        dimensions = [{"Name": "EngagementLevel", "Value": level}]
        emit_metric("UserEngagement", 1, "Count", dimensions)


class SystemMetrics:
    """System-wide performance and health metrics"""

    @staticmethod
    def cold_start() -> None:
        """Track Lambda cold starts"""
        emit_metric("ColdStart", 1, "Count")

    @staticmethod
    def memory_usage(memory_mb: float) -> None:
        """Track Lambda memory usage"""
        emit_metric("MemoryUsage", memory_mb, "Megabytes")

    @staticmethod
    def concurrent_executions(count: int) -> None:
        """Track concurrent Lambda executions"""
        emit_metric("ConcurrentExecutions", count, "Count")

    @staticmethod
    def error_occurred(error_type: str, operation: str) -> None:
        """Track application errors by type and operation"""
        dimensions = [
            {"Name": "ErrorType", "Value": error_type},
            {"Name": "Operation", "Value": operation}
        ]
        emit_metric("ApplicationError", 1, "Count", dimensions)

    @staticmethod
    def database_operation(operation: str, duration_ms: float, success: bool) -> None:
        """Track DynamoDB operation performance"""
        dimensions = [
            {"Name": "Operation", "Value": operation},
            {"Name": "Success", "Value": str(success)}
        ]
        emit_metric("DatabaseOperation", 1, "Count", dimensions)
        emit_metric("DatabaseLatency", duration_ms, "Milliseconds", dimensions)
