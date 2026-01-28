import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    // Modifier la colonne password_hash pour permettre NULL
    await queryInterface.changeColumn('users', 'password_hash', {
      type: DataTypes.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    // Remettre la contrainte NOT NULL
    await queryInterface.changeColumn('users', 'password_hash', {
      type: DataTypes.TEXT,
      allowNull: false
    });
  }
};
