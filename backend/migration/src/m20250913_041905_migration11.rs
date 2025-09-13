use sea_orm_migration::prelude::*;

#[derive(DeriveIden)]
pub enum Urls {
    Table,
    CreatedAt,
    LastClicked,
}

#[derive(DeriveIden)]
pub enum Clicks {
    Table,
    ClickedAt,
}

#[derive(DeriveIden)]
pub enum Users {
    Table,
    CreatedAt,
    ResetKeyExpires,
    VerificationKeyExpires,
    LastReset,
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
                    .modify_column(
                        ColumnDef::new(Urls::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .modify_column(
                        ColumnDef::new(Urls::LastClicked)
                            .timestamp_with_time_zone()
                            .null(),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Clicks::Table)
                    .modify_column(
                        ColumnDef::new(Clicks::ClickedAt)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Users::Table)
                    .modify_column(
                        ColumnDef::new(Users::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .modify_column(
                        ColumnDef::new(Users::ResetKeyExpires)
                            .timestamp_with_time_zone()
                            .null(),
                    )
                    .modify_column(
                        ColumnDef::new(Users::VerificationKeyExpires)
                            .timestamp_with_time_zone()
                            .null(),
                    )
                    .modify_column(
                        ColumnDef::new(Users::LastReset)
                            .timestamp_with_time_zone()
                            .null(),
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
                    .modify_column(ColumnDef::new(Urls::CreatedAt).date_time().not_null())
                    .modify_column(ColumnDef::new(Urls::LastClicked).date_time().null())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Clicks::Table)
                    .modify_column(ColumnDef::new(Clicks::ClickedAt).date_time().not_null())
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Users::Table)
                    .modify_column(ColumnDef::new(Users::CreatedAt).date_time().not_null())
                    .modify_column(ColumnDef::new(Users::ResetKeyExpires).date_time().null())
                    .modify_column(
                        ColumnDef::new(Users::VerificationKeyExpires)
                            .date_time()
                            .null(),
                    )
                    .modify_column(ColumnDef::new(Users::LastReset).date_time().null())
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}
