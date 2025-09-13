use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveIden)]
pub enum Urls {
    Table,
    UserId,
    Clicks,
    Comments,
    CreatedAt,
}

#[derive(DeriveIden)]
pub enum Users {
    Table,
    Id,
    Name,
    Email,
    CreatedAt,
    Banned,
}

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Users::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Users::Id)
                            .string()
                            .primary_key()
                            .not_null()
                            .to_owned(),
                    )
                    .col(string(Users::Name))
                    .col(string(Users::Email))
                    .col(date_time(Users::CreatedAt).default(Expr::current_timestamp()))
                    .col(boolean(Users::Banned).default(false))
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Urls::Table)
                    .add_column(string_null(Urls::UserId))
                    .add_column(integer(Urls::Clicks).default(0))
                    .add_column(text_null(Urls::Comments))
                    .modify_column(date_time(Urls::CreatedAt).default(Expr::current_timestamp()))
                    .to_owned(),
            )
            .await?;

        manager
            .get_connection()
            .execute_unprepared(
                r#"
                    UPDATE urls SET user_id = '0' WHERE user_id IS NULL;
                    INSERT INTO users (id, name, email, banned) VALUES ('0', 'test', 'test@example.com', false);
                "#,
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Urls::Table)
                    .modify_column(ColumnDef::new(Urls::UserId).string().not_null())
                    .add_foreign_key(
                        &TableForeignKey::new()
                            .name("fk_user_urls")
                            .from_tbl(Urls::Table)
                            .from_col(Urls::UserId)
                            .to_tbl(Users::Table)
                            .to_col(Users::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .to_owned(),
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
                    .drop_foreign_key("fk_user_urls")
                    .drop_column(Urls::UserId)
                    .drop_column(Urls::Clicks)
                    .drop_column(Urls::Comments)
                    .modify_column(date_time(Urls::CreatedAt).default(Expr::value(0)))
                    .to_owned(),
            )
            .await?;

        manager
            .drop_table(Table::drop().table(Users::Table).to_owned())
            .await?;

        Ok(())
    }
}
