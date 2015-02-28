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

			string connectionStr = string.Format("Data Source={0};Version=3;", dbPath);
			SqliteConnection database = new SqliteConnection(connectionStr);
			database.Open();

			string retrieveTable = "select * from zmslog order by Z_PK";
			SqliteCommand tableCmd = new SqliteCommand(retrieveTable, database);
			SqliteDataReader tableReader = tableCmd.ExecuteReader();

			string outFormat = "{0}-> Sugar: {1}, Basal: {2}";
			tableReader.Read();
			Console.WriteLine(string.Format(outFormat, tableReader["Z_PK"],
				tableReader["ZBLOODGLUCOSEMEASUREMENT"], tableReader["ZPENBASALINJECTIONUNITS"]));

			database.Close();
		}
	}
}
