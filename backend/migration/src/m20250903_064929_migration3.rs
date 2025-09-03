use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveIden)]
pub enum Users {
    Table,
    ResetKey,
    ResetKeyExpires,
    LastReset,
    VerificationKey,
    VeriricationKeyExpires,
    Verified,
}

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Users::Table)
                    .add_column(string_null(Users::ResetKey))
                    .add_column(date_time_null(Users::ResetKeyExpires))
                    .add_column(date_time_null(Users::LastReset))
                    .add_column(string_null(Users::VerificationKey))
                    .add_column(date_time_null(Users::VeriricationKeyExpires))
                    .add_column(boolean(Users::Verified).default(false))
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Users::Table).to_owned())
            .await?;

        Ok(())
    }
}
