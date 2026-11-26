package com.aj.moneypro.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "accounts")
data class AccountEntity(
    @PrimaryKey val id: String,
    val name: String,
    val type: String,
    val openingBalance: Double,
    val balance: Double,
    val accountNumber: String? = null,
    val color: String,
    val icon: String
)
