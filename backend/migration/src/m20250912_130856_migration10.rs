use sea_orm_migration::prelude::*;

#[derive(DeriveIden)]
pub enum Clicks {
    Table,
    Id,
    UrlId,
    ClickedAt,
    IpAddress,
    UserAgent,
}

#[derive(DeriveIden)]
pub enum Urls {
    Table,
    Id,
}

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Clicks::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Clicks::Id).string().primary_key().not_null())
                    .col(ColumnDef::new(Clicks::UrlId).string().not_null())
                    .col(ColumnDef::new(Clicks::ClickedAt).timestamp().not_null())
                    .col(ColumnDef::new(Clicks::IpAddress).string().null())
                    .col(ColumnDef::new(Clicks::UserAgent).string().null())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Clicks::Table)
                    .add_foreign_key(
                        TableForeignKey::new()
                            .name("fk-clicks-url_id")
                            .from_tbl(Clicks::Table)
                            .from_col(Clicks::UrlId)
                            .to_tbl(Urls::Table)
                            .to_col(Urls::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Clicks::Table).to_owned())
            .await?;

        Ok(())
    }
}
