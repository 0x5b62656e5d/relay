pub use sea_orm_migration::prelude::*;

mod m20250720_030347_migration;
mod m20250818_012225_migration2;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20250720_030347_migration::Migration),
            Box::new(m20250818_012225_migration2::Migration),
        ]
    }
}
