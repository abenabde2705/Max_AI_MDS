import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    // Add googleId column
    await queryInterface.addColumn('users', 'google_id', {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    });

    // Add facebookId column
    await queryInterface.addColumn('users', 'facebook_id', {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    });
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    // Remove googleId column
    await queryInterface.removeColumn('users', 'google_id');

    // Remove facebookId column
    await queryInterface.removeColumn('users', 'facebook_id');
  }
};
