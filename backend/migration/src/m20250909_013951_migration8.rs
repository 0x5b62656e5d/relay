use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveIden)]
pub enum Urls {
    Table,
    UserId,
}

#[derive(DeriveIden)]
pub enum Users {
    Table,
    Id,
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
                    .drop_column(Urls::UserId)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Urls::Table)
                    .add_column(string_null(Urls::UserId))
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Urls::Table)
                    .add_foreign_key(
                        TableForeignKey::new()
                            .name("fk-urls-user_id")
                            .from_tbl(Users::Table)
                            .from_col(Urls::UserId)
                            .to_tbl(Users::Table)
                            .to_col(Users::Id),
                    )
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
                    .drop_foreign_key("fk-urls-user_id")
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Urls::Table)
                    .drop_column(Urls::UserId)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Urls::Table)
                    .add_column(string_null(Urls::UserId))
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}
