package com.aj.moneypro.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey val id: String,
    val type: String,
    val title: String,
    val amount: Double,
    val categoryId: String,
    val accountId: String,
    val toAccountId: String? = null,
    val date: String,
    val time: String,
    val paymentMethod: String,
    val description: String? = null,
    val notes: String? = null,
    val receiptImage: String? = null,
    val isRecurring: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)
