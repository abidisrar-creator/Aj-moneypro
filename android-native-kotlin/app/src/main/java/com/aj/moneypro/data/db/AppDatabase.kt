package com.aj.moneypro.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.aj.moneypro.data.model.AccountEntity
import com.aj.moneypro.data.model.TransactionEntity

@Database(entities = [TransactionEntity::class, AccountEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun transactionDao(): TransactionDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "aj_moneypro_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
