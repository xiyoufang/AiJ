package com.xiyoufang.aij.core;

import com.jfinal.plugin.activerecord.IContainerFactory;
import com.jfinal.plugin.activerecord.dialect.Dialect;
import org.fest.reflect.core.Reflection;

import javax.sql.DataSource;

/**
 * Created by 席有芳 on 2018-12-21.
 *
 * @author 席有芳
 */
public class AiJDs {
    /**
     * 数据源
     */
    private DataSource dataSource;
    /**
     * 方言
     */
    private Dialect dialect;
    /**
     * ContainerFactory
     */
    private IContainerFactory containerFactory;
    /**
     * 数据源名称
     */
    private String name;
    /**
     * Flyway
     */
    private String table;
    /**
     * SQL的位置
     */
    private String location;
    /**
     * SQL的模板位置
     */
    private String sqlPath;

    public AiJDs(DataSource dataSource, String dialect, String dbType) {
        this(dataSource, dialect, "migrate_schema", "classpath:/migration/" + dbType + "/", "/sql/" + dbType);
    }

    public AiJDs(DataSource dataSource, String dialect, String table, String dbType) {
        this(dataSource, dialect, table, "classpath:/migration/" + dbType + "/", "/sql/" + dbType);
    }

    public AiJDs(DataSource dataSource, String dialect, String table, String location, String sqlPath) {
        this.dataSource = dataSource;
        this.table = table;
        this.location = location;
        this.sqlPath = sqlPath;
        try {
            this.dialect = Reflection.type(dialect).withClassLoader(getClass().getClassLoader()).loadAs(Dialect.class).newInstance();
        } catch (Exception e) {
            throw new RuntimeException("create " + dialect + " instance exception", e);
        }
    }


    public AiJDs(DataSource dataSource, Dialect dialect, IContainerFactory containerFactory, String table, String dbType) {
        this(dataSource, dialect, containerFactory, table, "classpath:/migration/" + dbType + "/", "/sql/" + dbType);
    }

    public AiJDs(DataSource dataSource, Dialect dialect, IContainerFactory containerFactory, String table, String location, String sqlPath) {
        this.dataSource = dataSource;
        this.dialect = dialect;
        this.containerFactory = containerFactory;
        this.table = table;
        this.location = location;
        this.sqlPath = sqlPath;
    }

    public DataSource getDataSource() {
        return dataSource;
    }

    public void setDataSource(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public Dialect getDialect() {
        return dialect;
    }

    public void setDialect(Dialect dialect) {
        this.dialect = dialect;
    }

    public IContainerFactory getContainerFactory() {
        return containerFactory;
    }

    public void setContainerFactory(IContainerFactory containerFactory) {
        this.containerFactory = containerFactory;
    }

    public String getTable() {
        return table;
    }

    public void setTable(String table) {
        this.table = table;
    }

    public String getLocation() {
        return (location.endsWith("/") ? location : location.concat("/")) + name;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public String getSqlPath() {
        return (sqlPath.endsWith("/") ? sqlPath : sqlPath.concat("/")) + name;
    }

    public void setSqlPath(String sqlPath) {
        this.sqlPath = sqlPath;
    }
}
