require('@dotenvx/dotenvx').config({ quiet: true })

const { Sequelize, QueryTypes } = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL, { logging: false, })

const main = async () => {
  try {
    await sequelize.authenticate()

    const blogs = await sequelize.query("SELECT author,title,likes FROM blogs", { type: QueryTypes.SELECT })
    for (let blog of blogs) {
      console.log(`${blog.author}: '${blog.title}', ${blog.likes} likes`)
    }
    sequelize.close()
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

main()