use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveIden)]
pub enum Urls {
    Table,
    LastClicked,
}

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Urls::Table)
                    .add_column(date_time_null(Urls::LastClicked))
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Urls::Table)
                    .drop_column(Urls::LastClicked)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}
