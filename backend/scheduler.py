from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import logging
from datetime import datetime
from .dal_calculator import DALCalculator

logger = logging.getLogger(__name__)

class DALScheduler:
    """Scheduler for periodic DAL statistics updates"""
    
    def __init__(self, calculator: DALCalculator, update_interval: int = 300):
        """
        Initialize the DAL scheduler.
        
        Args:
            calculator: DAL calculator instance
            update_interval: Update interval in seconds (default: 5 minutes)
        """
        self.calculator = calculator
        self.update_interval = update_interval
        self.scheduler = BackgroundScheduler()
        self.setup_jobs()

    def setup_jobs(self):
        """Configure scheduled jobs"""
        self.scheduler.add_job(
            func=self._update_stats,
            trigger=IntervalTrigger(seconds=self.update_interval),
            id='update_dal_stats',
            name='Update DAL Statistics',
            replace_existing=True
        )

    def _update_stats(self):
        """Update DAL statistics"""
        try:
            logger.info("Starting DAL statistics update")
            stats = self.calculator.calculate_stats()
            logger.info(f"DAL statistics update completed for cycle {stats.cycle}")
        except Exception as e:
            logger.error(f"Error updating DAL statistics: {e}")

    def start(self):
        """Start the scheduler"""
        if not self.scheduler.running:
            self.scheduler.start()
            logger.info("DAL scheduler started")
            # Force an immediate first update
            self._update_stats()

    def stop(self):
        """Stop the scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("DAL scheduler stopped") 