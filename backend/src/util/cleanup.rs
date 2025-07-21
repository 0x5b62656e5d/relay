use chrono::{Duration, Utc};
use entity::urls;
use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use tokio_cron_scheduler::{Job, JobScheduler};

pub async fn start_cron_jobs(db: DatabaseConnection) {
    let scheduler: JobScheduler = JobScheduler::new().await.unwrap_or_else(|_| {
        panic!("Failed to create JobScheduler");
    });

    let db_clone: DatabaseConnection = db.clone();

    let job: Job = Job::new_async("0 0 0 * * *", move |_, _| {
        let db: DatabaseConnection = db_clone.clone();

        Box::pin(async move {
            urls::Entity::delete_many()
                .filter(urls::Column::CreatedAt.lt((Utc::now() - Duration::days(14)).naive_utc()))
                .exec(&db)
                .await
                .unwrap_or_else(|err| {
                    panic!("Failed to delete old URLs: {}", err);
                });
        })
    })
    .unwrap_or_else(|err| {
        panic!("Failed to create job: {}", err);
    });

    scheduler.add(job).await.unwrap_or_else(|err| {
        panic!("Failed to add job to scheduler: {}", err);
    });

    scheduler.start().await.unwrap_or_else(|err| {
        panic!("Failed to start scheduler: {}", err);
    });
}
