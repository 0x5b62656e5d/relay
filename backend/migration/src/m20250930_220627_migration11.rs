use sea_orm_migration::prelude::*;

#[derive(DeriveIden)]
pub enum Clicks {
    Table,
    IsBot,
    Country,
    IpAddress,
}

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Clicks::Table)
                    .add_column(
                        ColumnDef::new(Clicks::IsBot)
                            .boolean()
                            .not_null()
                            .default(false),
                    )
                    .add_column(ColumnDef::new(Clicks::Country).string().null())
                    .drop_column(Clicks::IpAddress)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(Clicks::Table)
                    .drop_column(Clicks::IsBot)
                    .drop_column(Clicks::Country)
                    .add_column(ColumnDef::new(Clicks::IpAddress).string().null())
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}
