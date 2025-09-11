pub use sea_orm_migration::prelude::*;

mod m20250720_030347_migration;
mod m20250818_012225_migration2;
mod m20250903_064929_migration3;
mod m20250903_071658_migration4;
mod m20250903_092811_migration5;
mod m20250908_013100_migration7;
mod m20250909_013951_migration8;
mod m20250911_004238_migration9;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20250720_030347_migration::Migration),
            Box::new(m20250818_012225_migration2::Migration),
            Box::new(m20250903_064929_migration3::Migration),
            Box::new(m20250903_071658_migration4::Migration),
            Box::new(m20250903_092811_migration5::Migration),
            Box::new(m20250908_013100_migration7::Migration),
            Box::new(m20250909_013951_migration8::Migration),
            Box::new(m20250911_004238_migration9::Migration),
        ]
    }
}
