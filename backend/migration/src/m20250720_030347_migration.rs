use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveIden)]
pub enum Urls {
    Table,
    Id,
    Url,
    CreatedAt,
}

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Urls::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Urls::Id)
                            .string()
                            .primary_key()
                            .not_null()
                            .to_owned(),
                    )
                    .col(string(Urls::Url))
                    .col(date_time(Urls::CreatedAt))
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Urls::Table).to_owned())
            .await
    }
}
