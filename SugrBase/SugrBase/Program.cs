//
//  Program.cs
//
//  Author:
//       Benito Palacios Sánchez <benito356@gmail.com>
//
//  Copyright (c) 2015 Benito Palacios Sánchez
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.
using System;
using Mono.Data.Sqlite;

namespace SugrBase
{
	class MainClass
	{
		public static void Main(string[] args)
		{
			string dbPath = "/home/benito/workdir/MySugrDatabaseV1.sqlite";

			var connectionStr = new SqliteConnectionStringBuilder();
			connectionStr.DataSource = dbPath;

			var database = new SqliteConnection(connectionStr.ConnectionString);
			database.Open();

			string retrieveTable = "select * from zmslog order by Z_PK";
			var tableCmd = new SqliteCommand(retrieveTable, database);
			var tableReader = tableCmd.ExecuteReader();

			string outFormat = "{0}-> Sugar: {1}, Basal: {2}";
			tableReader.Read();
			Console.WriteLine(string.Format(outFormat, tableReader["Z_PK"],
				tableReader["ZBLOODGLUCOSEMEASUREMENT"], tableReader["ZPENBASALINJECTIONUNITS"]));

			var insertBuilder = new SqliteCommandBuilder();
			insertBuilder.DataAdapter = new SqliteDataAdapter("select * from zmslog", database);
			var cmd = insertBuilder.GetInsertCommand(true);
			cmd.Parameters.AddWithValue("Z_PK", 1170);
			cmd.Parameters.AddWithValue("ZBLOODGLUCOSEMEASUREMENT", 99);
			cmd.Parameters.AddWithValue("ZPENBASALINJECTIONUNITS", 12);
			Console.WriteLine(cmd.ExecuteNonQuery());

		 	retrieveTable = "select * from zmslog order by Z_PK desc";
			tableCmd = new SqliteCommand(retrieveTable, database);
			tableReader = tableCmd.ExecuteReader();

			outFormat = "{0}-> Sugar: {1}, Basal: {2}";
			tableReader.Read();
			Console.WriteLine(string.Format(outFormat, tableReader["Z_PK"],
				tableReader["ZBLOODGLUCOSEMEASUREMENT"], tableReader["ZPENBASALINJECTIONUNITS"]));

			database.Close();
		}
	}
}
